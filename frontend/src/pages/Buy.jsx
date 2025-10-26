import React, {useState} from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const API_URL = import.meta.env.VITE_API_URL

export default function Buy(){
  const { getAccessTokenSilently } = useAuth0()
  const [nationalId,setNationalId]=useState('')
  const [numbers,setNumbers]=useState('')
  const [error,setError]=useState(null)
  const [qr, setQr] = useState(null)
  const [link, setLink] = useState(null)

  const submit = async e=>{
    e.preventDefault()
    setError(null)
    setQr(null)
    setLink(null)
    const nums = numbers.split(',').map(s=>s.trim()).filter(Boolean).map(Number)
    try{
      const token = await getAccessTokenSilently()
      const res = await fetch(`${API_URL}/tickets`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({nationalId, numbers: nums})
      })
      if (!res.ok) {
        const j = await res.json().catch(()=>({error:'Unknown'}))
        setError(j.error || 'Error')
        return
      }
      const j = await res.json()
      setQr(j.qr)
      setLink(j.link)
    }catch(err){
      setError('Network error')
    }
  }

  return (
    <div style={{padding:20}}>
      <h2>Buy ticket</h2>
      <form onSubmit={submit}>
        <div>
          <label>National ID (max 20):</label><br/>
          <input value={nationalId} onChange={e=>setNationalId(e.target.value)} />
        </div>
        <div>
          <label>Numbers (6-10 numbers, comma separated):</label><br/>
          <input value={numbers} onChange={e=>setNumbers(e.target.value)} />
        </div>
        <button type="submit">Submit</button>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
      {qr && <div>
        <h3>Your ticket QR</h3>
        <img src={qr} alt="qr"/>
        {link && <div><a href={link} target="_blank" rel="noopener noreferrer">View ticket</a></div>}
      </div>}
    </div>
  )
}
