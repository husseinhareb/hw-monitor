// src/hooks/Performance/useDiskData.ts

import { useState, useEffect, useRef } from 'react'
import { invoke } from '@tauri-apps/api/tauri'

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
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    let timerId: number

    // 1) fetch raw stats from Rust
    async function fetchOnce() {
      try {
        const raw: DiskRaw[] = await invoke('get_disks') as DiskRaw[]
        if (!mounted.current) return

        setHistoryMap(prev => {
          // fold each disk into a new map
          const next: Record<string,Hist> = {}

          raw.forEach(d => {
            const prevH = prev[d.name] ?? {
              readHistory:  [0],      // if never seen before, start with a 0 sample
              writeHistory: [0],
              total_read:   d.total_read,
              total_write:  d.total_write,
            }

            const readSpeed  = parseFloat(d.read_speed)  || 0
            const writeSpeed = parseFloat(d.write_speed) || 0

            next[d.name] = {
              readHistory:  [...prevH.readHistory,  readSpeed ].slice(-100),
              writeHistory: [...prevH.writeHistory, writeSpeed].slice(-100),
              total_read:   d.total_read,
              total_write:  d.total_write,
            }
          })

          return next
        })
      } catch (err) {
        console.error('useDiskData › fetchOnce error', err)
      }
    }

    // 2) do one immediate pass to both
    //    • seed every disk with [0]  
    //    • then overwrite with the real first measurement
    fetchOnce()

    // 3) now start polling
    timerId = window.setInterval(fetchOnce, updateInterval)

    return () => {
      mounted.current = false
      window.clearInterval(timerId)
    }
  }, [updateInterval])

  return historyMap
}
