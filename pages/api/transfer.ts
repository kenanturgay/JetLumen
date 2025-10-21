import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

const statePath = path.join(process.cwd(), 'data', 'state.json')

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { sender, recipient, amount } = req.body
    const raw = fs.readFileSync(statePath, 'utf-8')
    const json = JSON.parse(raw)
    // update total as decimal string addition (simple)
    const total = (parseFloat(json.total) + parseFloat(amount)).toString()
    json.total = total
    json.lastRecipient = recipient
    fs.writeFileSync(statePath, JSON.stringify(json, null, 2))
    res.status(200).json({ success: true, total: json.total, lastRecipient: json.lastRecipient })
  } else {
    res.status(405).end()
  }
}
