import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { EventsService } from './events.service.js';
import { EventsQueryDto } from './dto/events-query.dto.js';
import { CreateEventDto } from './dto/create-event.dto.js';
import { ApiKeyGuard } from '../common/api-key/api-key.guard.js';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // GET /api/events
  @Get()
  findAll(@Query() query: EventsQueryDto) {
    return this.eventsService.findAll(query);
  }

  // GET /api/events/upcoming
  @Get('upcoming')
  findUpcoming() {
    return this.eventsService.findUpcoming();
  }

  // GET /api/events/test-number/:id
  // Demonstrates ParseIntPipe
  @Get('test-number/:id')
  testNumber(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'ParseIntPipe works correctly',
      receivedNumber: id,
      type: typeof id,
    };
  }

  // GET /api/events/:id/sessions
  @Get(':id/sessions')
  findSessions(@Param('id') id: string) {
    return this.eventsService.findSessions(id);
  }

  // GET /api/events/:id/sessions/:sessionId
  @Get(':id/sessions/:sessionId')
  findSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.eventsService.findSession(id, sessionId);
  }

  // POST /api/events - Requires API key
  @UseGuards(ApiKeyGuard)
  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  // GET /api/events/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }
}