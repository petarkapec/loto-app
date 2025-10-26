import React, {useEffect, useState} from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL

export default function Home(){
  const [status, setStatus] = useState(null)
  const [lastRound, setLastRound] = useState(null)

  useEffect(()=>{
    fetch(`${API_URL}/status`).then(r=>r.json()).then(setStatus).catch(()=>setStatus(null))
    fetch(`${API_URL}/last-finished-round`).then(r=>r.json()).then(setLastRound).catch(()=>setLastRound(null))
  },[])

  return (
    <div style={{maxWidth:500,margin:'40px auto',padding:24,background:'#f8f8ff',borderRadius:12,boxShadow:'0 2px 8px #0001'}}>
      <h1 style={{textAlign:'center',marginBottom:24}}>Loto aplikacija</h1>
      <div style={{marginBottom:24}}>
        <strong>Trenutno kolo:</strong><br/>
        {status && status.active ? (
          <div>
            <span style={{fontWeight:'bold'}}>Kolo #{status.id}</span><br/>
            <span>Broj uplaćenih listića: <b>{status.ticketsCount}</b></span><br/>
            {status.results && status.results.length > 0 ? (
              <span>Izvučeni brojevi: <b>{status.results.join(', ')}</b></span>
            ) : (
              <span>Izvučeni brojevi: <i>još nisu objavljeni</i></span>
            )}
          </div>
        ) : (
          <span>Nema aktivnog kola</span>
        )}
      </div>
      <div style={{marginBottom:24}}>
        <strong>Zadnje završeno kolo:</strong><br/>
        {lastRound && lastRound.id ? (
          <div>
            <span style={{fontWeight:'bold'}}>Kolo #{lastRound.id}</span><br/>
            {lastRound.results && lastRound.results.length > 0 ? (
              <span>Izvučeni brojevi: <b>{lastRound.results.join(', ')}</b></span>
            ) : (
              <span>Izvučeni brojevi: <i>još nisu objavljeni</i></span>
            )}
          </div>
        ) : (
          <span>Nema završenih kola</span>
        )}
      </div>
      <div style={{textAlign:'center'}}>
        <Link to="/buy" style={{padding:'10px 24px',background:'#2d6cdf',color:'#fff',borderRadius:6,textDecoration:'none',fontWeight:'bold'}}>Uplati listić</Link>
      </div>
    </div>
  )
}
