// src/hooks/Performance/useDiskData.ts

import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { usePaused, notify } from '../../services/store'
import useSerialPolling from '../useSerialPolling'

export interface DiskRaw {
  name: string
  read_speed: string    // KB/s serialized from Rust
  write_speed: string   // KB/s
  total_read: number    // bytes
  total_write: number   // bytes
}

interface Hist {
  readHistory:  number[]
  writeHistory: number[]
  total_read:   number
  total_write:  number
}

export default function useDiskData(updateInterval: number): Record<string,Hist> {
  const [historyMap, setHistoryMap] = useState<Record<string,Hist>>({})
  const paused = usePaused()

  useSerialPolling({
    enabled: !paused,
    interval: updateInterval,
    poll: () => invoke<DiskRaw[]>('get_disks'),
    onSuccess: (raw) => {
        setHistoryMap(prev => {
          const next: Record<string,Hist> = {}

          raw.forEach(d => {
            const prevH = prev[d.name] ?? {
              readHistory:  [0],
              writeHistory: [0],
              total_read:   d.total_read,
              total_write:  d.total_write,
            }

            const readSpeed  = parseFloat(d.read_speed)  || 0
            const writeSpeed = parseFloat(d.write_speed) || 0

            next[d.name] = {
              readHistory:  [...prevH.readHistory,  readSpeed ].slice(-20),
              writeHistory: [...prevH.writeHistory, writeSpeed].slice(-20),
              total_read:   d.total_read,
              total_write:  d.total_write,
            }
          })

          return next
        })
    },
    onError: (err) => {
      console.error('useDiskData › fetchOnce error', err)
      notify('error.fetch_failed')
    },
  })

  return historyMap
}
