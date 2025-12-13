'use server'

import { exec } from 'child_process'
import { readFile, writeFile } from 'fs/promises'
import { nanoid } from 'nanoid'
import util from 'util'
import z from 'zod'
import { JutgeApiClient } from '../lib/jutge_api_client'

const execAsync = util.promisify(exec)

export type MakeExamPdfData = {
    exam_nm: string
    token: string
    extra: string
}

const zMakeExamPdfData = z.object({
    exam_nm: z.string(),
    token: z.string(),
    extra: z.string(),
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
            pdfs.push(problem_id)
            const download = await jutge.problems.getPdfStatement(problem_id)
            const path = `${tmp}/${problem_id}.pdf`
            await writeFile(path, download.data)
        }
    }

    // make cover page

    let mdProblems = ''
    for (const examProblem of exam.problems) {
        mdProblems += `* **${examProblem.caption}:**\n`
        const abstractProblem = await jutge.problems.getAbstractProblem(examProblem.problem_nm)
        for (const problem_id in abstractProblem.problems) {
            mdProblems += `  - [\`${problem_id}\`](https://jutge.org/problems/${problem_id}): ${abstractProblem.problems[problem_id].title}\n`
        }
        mdProblems += `\n`
        mdProblems += `\n`
    }

    const markdown = `---
mainfont: "Helvetica"
fontsize: 12pt
colorlinks: true
geometry: a4paper
---

## ${exam.course?.title}

# ${exam.title}

${exam.description}

${mdProblems}

---

${data.extra}

    `

    await writeFile(`${tmp}/cover.md`, markdown)
    //await execAsync(`iconv -c -f utf-8 -t latin1 ${tmp}/cover.txt > ${tmp}/cover.txt.iconv`)
    await execAsync(`pandoc  --variable mainfont="Palatino" ${tmp}/cover.md -o ${tmp}/cover.pdf`)
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
