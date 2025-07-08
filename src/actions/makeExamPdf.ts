'use server'

import { JutgeApiClient } from '@/lib/jutge_api_client'
import { exec } from 'child_process'
import { readFile, writeFile } from 'fs/promises'
import { nanoid } from 'nanoid'
import util from 'util'
import z from 'zod'

const execAsync = util.promisify(exec)

export type MakeExamPdfData = {
    exam_nm: string
    token: string
}

const zMakeExamPdfData = z.object({
    exam_nm: z.string(),
    token: z.string(),
})

export async function makeExamPdf(data: MakeExamPdfData): Promise<Blob> {
    zMakeExamPdfData.parse(data)

    const jutge = new JutgeApiClient()
    jutge.meta = { token: data.token }

    const profile = await jutge.student.profile.get()
    if (!profile.instructor) throw new Error('You are not an instructor')

    const exam = await jutge.instructor.exams.get(data.exam_nm)
    if (!exam) throw new Error(`Exam ${data.exam_nm} not found`)

    const tmp = `/tmp/prof/${nanoid()}`
    await execAsync(`mkdir -p ${tmp}`)
    const pdfs = []

    // get all the problem statements in PDF format
    for (const examProblem of exam.problems) {
        const abstractProblem = await jutge.problems.getAbstractProblem(examProblem.problem_nm)
        for (const problem_id in abstractProblem.problems) {
            if (
                abstractProblem.problems[problem_id].original_language_id ===
                abstractProblem.problems[problem_id].language_id
            ) {
                pdfs.push(problem_id)
                const download = await jutge.problems.getPdfStatement(problem_id)
                const path = `${tmp}/${problem_id}.pdf`
                await writeFile(path, download.data)
                break
            }
        }
    }

    // make cover page
    const text = `

${exam.title}
${exam.course?.title}

    `
    await writeFile(`${tmp}/cover.txt`, text)
    await execAsync(`iconv -c -f utf-8 -t latin1 ${tmp}/cover.txt > ${tmp}/cover.txt.iconv`)
    await execAsync(`enscript ${tmp}/cover.txt.iconv -p ${tmp}/cover.ps --no-header --columns=1`)
    await execAsync(`ps2pdf ${tmp}/cover.ps ${tmp}/cover.pdf`)
    pdfs.unshift('cover')

    // concatenate all the PDFs into a single PDF
    await execAsync(
        `gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile=${tmp}/exam.pdf ${pdfs.map((pdf) => `${tmp}/${pdf}.pdf`).join(' ')}`,
    )

    // build the blob of the generated file
    const buffer = await readFile(`${tmp}/exam.pdf`)
    const blob = new Blob([buffer], { type: 'application/pdf' })

    // clean up the temporary files
    await execAsync(`rm -rf ${tmp}`)

    // return the blob
    return blob
}
