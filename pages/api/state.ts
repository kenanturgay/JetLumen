import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const statePath = path.join(process.cwd(), 'data', 'state.json')

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const raw = fs.readFileSync(statePath, 'utf-8')
    const json = JSON.parse(raw)
    res.status(200).json(json)
  } else {
    res.status(405).end()
  }
}
