import { useState } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import useStore from '@/store/useStore'

export default function Login() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('changeme')
  const { login } = useStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(username, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-6 md:p-8 bg-card rounded-lg border border-border">
        <div className="mb-6 md:mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-secondary flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="2.5" fill="#284CAC"/>
              <circle cx="22" cy="10" r="2.5" fill="#284CAC"/>
              <circle cx="16" cy="22" r="2.5" fill="#284CAC"/>
              <line x1="10" y1="10" x2="22" y2="10" stroke="#284CAC" strokeWidth="1.5"/>
              <line x1="10" y1="10" x2="16" y2="22" stroke="#284CAC" strokeWidth="1.5"/>
              <line x1="22" y1="10" x2="16" y2="22" stroke="#284CAC" strokeWidth="1.5"/>
              <circle cx="16" cy="14" r="1.5" fill="#e4e4e7"/>
            </svg>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-primary">
            Knowledge Base
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-2">
            Sign in to access your notes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full mt-6">
            Login
          </Button>
        </form>

        <div className="mt-4 text-xs text-center text-muted-foreground">
          Default: admin / changeme
        </div>
      </div>
    </div>
  )
}
