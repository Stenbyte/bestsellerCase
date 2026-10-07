import type { Router } from 'express'
import { authorize } from '../middleware/auth.js'
import { validateBody, validateQuery } from '../middleware/validate.js'
import {
  createTicketBodySchema,
  listTicketsQuerySchema,
  type CreateTicketBody,
  type ListTicketsQuery,
} from '../schemas/ticket.js'
import { schedulePartnerSimulation } from '../services/partnerSimulation.js'
import {
  approveTicket,
  createTicket,
  getTicketById,
  listApprovedPhotos,
  listTicketsFiltered,
  progressPartnerTicket,
  rejectTicket,
  sendTicket,
} from '../services/tickets.js'

function paramId(value: string | string[]): string {
  return Array.isArray(value) ? value[0]! : value
}

export function registerTickets(api: Router): void {
  api.get('/tickets', validateQuery(listTicketsQuerySchema), (req, res, next) => {
    try {
      const query = req.query as ListTicketsQuery
      const tickets = listTicketsFiltered(query)
      res.json({ tickets })
    } catch (err) {
      next(err)
    }
  })

  api.get('/approved', (_req, res, next) => {
    try {
      res.json({ approved: listApprovedPhotos() })
    } catch (err) {
      next(err)
    }
  })

  api.get('/tickets/:id', (req, res, next) => {
    try {
      const ticket = getTicketById(paramId(req.params.id))
      res.json({ ticket })
    } catch (err) {
      next(err)
    }
  })

  api.post('/tickets', validateBody(createTicketBodySchema), (req, res, next) => {
    try {
      const body = req.body as CreateTicketBody
      const ticket = createTicket(body, req.user!.id)
      res.status(201).json({ ticket })
    } catch (err) {
      next(err)
    }
  })

  api.post('/tickets/:id/send', (req, res, next) => {
    try {
      const id = paramId(req.params.id)
      const ticket = sendTicket(id, req.user!.id)
      schedulePartnerSimulation(id)
      res.json({ ticket })
    } catch (err) {
      next(err)
    }
  })

  api.post('/tickets/:id/partner-progress', (req, res, next) => {
    try {
      const ticket = progressPartnerTicket(paramId(req.params.id))
      res.json({ ticket })
    } catch (err) {
      next(err)
    }
  })

  api.post('/tickets/:id/approve', authorize('manager'), (req, res, next) => {
    try {
      const result = approveTicket(paramId(req.params.id), req.user!.id)
      res.json(result)
    } catch (err) {
      next(err)
    }
  })

  api.post('/tickets/:id/reject', authorize('manager'), (req, res, next) => {
    try {
      const ticket = rejectTicket(paramId(req.params.id), req.user!.id)
      res.json({ ticket })
    } catch (err) {
      next(err)
    }
  })
}
