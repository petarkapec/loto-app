import React, {useEffect, useState} from 'react'

export default function Home(){
  const [status, setStatus] = useState(null)
  useEffect(()=>{fetch('/api/status').then(r=>r.json()).then(setStatus).catch(()=>setStatus(null))},[])

  return (
    <div style={{padding:20}}>
      <h1>Loto</h1>
      <div>
        <strong>Current round:</strong>
        <div>{status && status.active ? `Round ${status.id} (tickets: ${status.ticketsCount})` : 'No active round'}</div>
        <div>{status && status.results ? `Results: ${status.results.join(', ')}` : ''}</div>
      </div>
    </div>
  )
}
