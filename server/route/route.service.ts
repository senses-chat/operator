import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RouteType, Route } from './models';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  public async getActiveRouteForSource(sourceType: RouteType, sourceName: string): Promise<Route | undefined> {
    return this.routeRepository.findOne({
      isActive: true,
      sourceType,
      sourceName,
    });
  }
}
