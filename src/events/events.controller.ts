import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { EventsService } from './events.service.js';
import { EventsQueryDto } from './dto/events-query.dto.js';
import { CreateEventDto } from './dto/create-event.dto.js';

@ApiTags('Events')
@ApiBearerAuth('bearer')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(@Query() query: EventsQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Get('upcoming')
  findUpcoming() {
    return this.eventsService.findUpcoming();
  }

  @Get('test-number/:id')
  testNumber(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'ParseIntPipe works correctly',
      receivedNumber: id,
      type: typeof id,
    };
  }

  @Get(':id/sessions')
  findSessions(@Param('id') id: string) {
    return this.eventsService.findSessions(id);
  }

  @Get(':id/sessions/:sessionId')
  findSession(
    @Param('id') id: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.eventsService.findSession(id, sessionId);
  }

  @Post()
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }
}