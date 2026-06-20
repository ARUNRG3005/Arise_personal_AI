import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io('/', {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('[ARISE] Socket connected:', socket?.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('[ARISE] Socket disconnected:', reason)
    })

    socket.on('connect_error', (err) => {
      console.error('[ARISE] Socket error:', err.message)
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Typed socket events
export const SocketEvents = {
  // Client → Server
  CHAT_MESSAGE: 'chat:message',
  CHAT_STOP: 'chat:stop',
  JOIN_CONVERSATION: 'chat:join',
  LEAVE_CONVERSATION: 'chat:leave',

  // Server → Client
  CHAT_STREAM: 'chat:stream',
  CHAT_TOOL_START: 'chat:tool_start',
  CHAT_TOOL_END: 'chat:tool_end',
  CHAT_DONE: 'chat:done',
  CHAT_ERROR: 'chat:error',
  NOTIFICATION: 'notification:new',
  TASK_UPDATED: 'task:updated',
  CALENDAR_UPDATED: 'calendar:updated',
  QUICK_CAPTURE_DONE: 'quick_capture:done',
} as const
