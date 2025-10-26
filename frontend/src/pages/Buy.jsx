import React, {useState} from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const API_URL = import.meta.env.VITE_API_URL

export default function Buy(){
  const { getAccessTokenSilently, user } = useAuth0()
  const [nationalId,setNationalId]=useState('')
  const [numbers,setNumbers]=useState('')
  const [error,setError]=useState(null)
  const [qr, setQr] = useState(null)
  const [link, setLink] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async e=>{
    e.preventDefault()
    setError(null)
    setQr(null)
    setLink(null)
    setLoading(true)
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
      setLoading(false)
      if (!res.ok) {
        const j = await res.json().catch(()=>({error:'Unknown'}))
        setError(j.error || 'Greška kod kupnje listića.')
        return
      }
      const j = await res.json()
      setQr(j.qr)
      setLink(j.link)
    }catch(err){
      setLoading(false)
      setError('Greška u mreži ili autentifikaciji.')
    }
  }

  return (
    <div style={{maxWidth:500,margin:'40px auto',padding:24,background:'#f8f8ff',borderRadius:12,boxShadow:'0 2px 8px #0001'}}>
      <h2 style={{textAlign:'center',marginBottom:24}}>Kupnja loto listića</h2>
      <form onSubmit={submit} style={{marginBottom:24}}>
        <div style={{marginBottom:16}}>
          <label>Broj osobne iskaznice ili putovnice (max 20 znakova):</label><br/>
          <input value={nationalId} onChange={e=>setNationalId(e.target.value)} style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        </div>
        <div style={{marginBottom:16}}>
          <label>Brojevi (6-10 brojeva, odvojeni zarezom, npr. 1,2,3,4,5,6):</label><br/>
          <input value={numbers} onChange={e=>setNumbers(e.target.value)} style={{width:'100%',padding:8,borderRadius:4,border:'1px solid #ccc'}} />
        </div>
        <button type="submit" style={{padding:'10px 24px',background:'#2d6cdf',color:'#fff',borderRadius:6,border:'none',fontWeight:'bold',width:'100%'}} disabled={loading}>{loading ? 'Kupujem...' : 'Kupi listić'}</button>
      </form>
      {error && <div style={{color:'#d00',marginBottom:16,textAlign:'center',fontWeight:'bold'}}>{error}</div>}
      {qr && <div style={{textAlign:'center',marginTop:24,padding:16,background:'#fff',borderRadius:8,boxShadow:'0 1px 4px #0001'}}>
        <h3>Vaš QR kod</h3>
        <img src={qr} alt="qr" style={{margin:'16px auto',maxWidth:200}}/>
        {link && <div style={{marginTop:8}}><a href={link} target="_blank" rel="noopener noreferrer" style={{color:'#2d6cdf',fontWeight:'bold'}}>Pogledaj listić</a></div>}
      </div>}
      {user && <div style={{marginTop:32,fontSize:14,color:'#555',textAlign:'center'}}>Prijavljeni ste kao: <b>{user.email}</b></div>}
    </div>
  )
}
