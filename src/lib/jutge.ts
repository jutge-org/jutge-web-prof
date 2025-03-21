'use client'

import { JutgeApiClient } from '@/lib/jutge_api_client'

const jutge = new JutgeApiClient()
//jutge.JUTGE_API_URL = 'http://localhost:8009/api'
jutge.clientTTLs.set('problems.getAllAbstractProblems', 300)
jutge.clientTTLs.set('problems.getAllProblems', 300)

export default jutge
