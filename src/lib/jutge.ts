'use client'

import { AbstractProblem, JutgeApiClient, Profile } from '@/lib/jutge_api_client'
import { Dict } from './utils'

const jutge = new JutgeApiClient()

jutge.clientTTLs.set('problems.getAllAbstractProblems', 300)
jutge.clientTTLs.set('problems.getAllProblems', 300)

export default jutge

export function getProblemTitle(
    user: Profile,
    problem_nm: string,
    abstractProblems: Dict<AbstractProblem>,
) {
    try {
        const abstractProblem = abstractProblems[problem_nm]
        const prefLanguageId = user.language_id
        const problem_id = abstractProblem.problem_nm + '_' + prefLanguageId
        if (problem_id in abstractProblem.problems) {
            return abstractProblem.problems[problem_id].title
        } else {
            for (const problem of Object.values(abstractProblem.problems)) {
                if (problem.translator === null) {
                    return problem.title
                }
            }
            for (const problem of Object.values(abstractProblem.problems)) {
                return problem.title
            }
            return problem_nm
        }
    } catch {
        return problem_nm
    }
}
