import { Injectable, NotFoundException } from '@nestjs/common';
import { Event } from './interfaces/event.interface.js';
import { Session } from './interfaces/session.interface.js';
import { CreateEventDto } from './dto/create-event.dto.js';

@Injectable()
export class EventsService {
  private events: Event[] = [
    {
      id: 'evt-101',
      title: 'Technology Workshop',
      description: 'Learn modern web development.',
      location: 'Main Campus',
      eventDate: '2026-12-04T09:00:00.000Z',
      category: 'technology',
      isPublished: true,
    },
    {
      id: 'evt-102',
      title: 'Business Conference',
      description: 'Explore entrepreneurship opportunities.',
      location: 'Business Block',
      eventDate: '2026-12-10T10:00:00.000Z',
      category: 'business',
      isPublished: true,
    },
    {
      id: 'evt-103',
      title: 'Programming Competition',
      description: 'Students compete in coding challenges.',
      location: 'Computer Lab',
      eventDate: '2026-12-15T08:00:00.000Z',
      category: 'technology',
      isPublished: true,
    },
    {
      id: 'evt-104',
      title: 'Graduation Ceremony',
      description: 'Annual student graduation celebration.',
      location: 'Main Campus',
      eventDate: '2026-11-01T09:00:00.000Z',
      category: 'education',
      isPublished: false,
    },
    {
      id: 'evt-105',
      title: 'Student Leadership Meeting',
      description: 'Discuss student leadership activities.',
      location: 'Student Center',
      eventDate: '2026-12-20T11:00:00.000Z',
      category: 'education',
      isPublished: false,
    },
  ];

  private sessions: Session[] = [
    {
      id: 'ses-101',
      eventId: 'evt-101',
      title: 'Introduction to Node.js',
      startsAt: '2026-12-04T09:00:00.000Z',
      endsAt: '2026-12-04T10:30:00.000Z',
      room: 'Room A',
    },
    {
      id: 'ses-102',
      eventId: 'evt-101',
      title: 'Building REST APIs',
      startsAt: '2026-12-04T11:00:00.000Z',
      endsAt: '2026-12-04T12:30:00.000Z',
      room: 'Room B',
    },
    {
      id: 'ses-103',
      eventId: 'evt-102',
      title: 'Starting a Business',
      startsAt: '2026-12-10T10:00:00.000Z',
      endsAt: '2026-12-10T11:30:00.000Z',
      room: 'Conference Hall',
    },
    {
      id: 'ses-104',
      eventId: 'evt-102',
      title: 'Business Growth Strategies',
      startsAt: '2026-12-10T12:00:00.000Z',
      endsAt: '2026-12-10T13:30:00.000Z',
      room: 'Conference Hall',
    },
  ];

  findAll(query: {
    category?: string;
    location?: string;
    isPublished?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }) {
    let results = [...this.events];

    if (query.category) {
      results = results.filter(
        (event) => event.category === query.category,
      );
    }

    if (query.location) {
      results = results.filter(
        (event) => event.location === query.location,
      );
    }

    if (query.isPublished !== undefined) {
      results = results.filter(
        (event) => event.isPublished === (query.isPublished === 'true'),
      );
    }

    const sortBy = query.sortBy || 'eventDate';
    const order = query.order || 'asc';

    results.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else {
        comparison = a.eventDate.localeCompare(b.eventDate);
      }

      return order === 'desc' ? -comparison : comparison;
    });

    const page = query.page || 1;
    const limit = query.limit || 10;

    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;

    const paginatedEvents = results.slice(
      startIndex,
      startIndex + limit,
    );

    return {
      data: paginatedEvents,
      total,
      page,
      limit,
      totalPages,
    };
  }

  findUpcoming() {
    const now = new Date();

    return this.events
      .filter((event) => new Date(event.eventDate) > now)
      .sort(
        (a, b) =>
          new Date(a.eventDate).getTime() -
          new Date(b.eventDate).getTime(),
      );
  }

  findOne(id: string): Event {
    const event = this.events.find((event) => event.id === id);

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  findSessions(eventId: string): Session[] {
    this.findOne(eventId);

    return this.sessions.filter(
      (session) => session.eventId === eventId,
    );
  }

  findSession(eventId: string, sessionId: string): Session {
    this.findOne(eventId);

    const session = this.sessions.find(
      (session) =>
        session.id === sessionId && session.eventId === eventId,
    );

    if (!session) {
      throw new NotFoundException(
        `Session ${sessionId} not found for event ${eventId}`,
      );
    }

    return session;
  }

  // Create a new event
  create(createEventDto: CreateEventDto): Event {
    const newEvent: Event = {
      id: `evt-${Date.now()}`,
      ...createEventDto,
    };

    this.events.push(newEvent);

    return newEvent;
  }
}