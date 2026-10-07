import type { Router } from 'express'
import { validateBody, validateQuery } from '../middleware/validate.js'
import {
  createTicketBodySchema,
  listTicketsQuerySchema,
  type CreateTicketBody,
  type ListTicketsQuery,
} from '../schemas/ticket.js'
import { createTicket, getTicketById, listTicketsFiltered } from '../services/tickets.js'

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

  api.get('/tickets/:id', (req, res, next) => {
    try {
      const ticket = getTicketById(req.params.id)
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
}
