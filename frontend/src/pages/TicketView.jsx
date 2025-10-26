import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom'

export default function TicketView(){
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  useEffect(()=>{
    fetch(`/api/ticket/${id}`).then(r=>r.json()).then(setTicket).catch(()=>setTicket(null))
  },[id])

  if (!ticket) return <div style={{padding:20}}>Loading...</div>
  if (ticket.error) return <div style={{padding:20}}>Not found</div>

  return (
    <div style={{padding:20}}>
      <h2>Ticket {ticket.id}</h2>
      <div>National ID: {ticket.nationalId}</div>
      <div>Numbers: {ticket.numbers.join(', ')}</div>
      <div>Round: {ticket.round.id}</div>
      <div>Results: {ticket.round.results ? ticket.round.results.join(', ') : 'Not drawn yet'}</div>
    </div>
  )
}
