import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'nestjs-redis';
import { Repository } from 'typeorm';

import { Route } from '../models';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    private readonly redisService: RedisService,
  ) {}
}
