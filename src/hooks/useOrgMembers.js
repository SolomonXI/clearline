import { useState, useEffect } from 'react'
import { getMyOrg } from '../api/organisations.js'

const COLORS = ['#4F6EF7', '#7C3AED', '#059669', '#D97706', '#EC4899', '#06B6D4']

function memberColor(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}

export function useOrgMembers() {
  const [members, setMembers] = useState([])

  useEffect(() => {
    getMyOrg()
      .then(org =>
        setMembers(
          org.members.map(m => ({
            id: m.user.id,
            name: m.user.name,
            initials: m.user.initials,
            role: m.role,
            color: memberColor(m.user.id),
          }))
        )
      )
      .catch(() => {}) // degrade gracefully — dropdown shows only Unassign
  }, [])

  return { members }
}
