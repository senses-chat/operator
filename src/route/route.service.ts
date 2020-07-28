import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

import { RasaService } from 'src/rasa';
import { WechatService } from 'src/wechat';

import { ChatRoute, RouteDefinition, RouteDefinitionComponent, RouteType, Route } from './models';
import { WechatChatRoute } from 'src/wechat/wechat.route';
import { RasaChatRoute } from 'src/rasa/rasa.route';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(
    private readonly rasaService: RasaService,
    private readonly wechatService: WechatService,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {
    this.logger.debug('setting up chat routes');
    this.rasaService.isReady.then(() => {
      this.setUpRoutes();
    });
  }

  public async setUpRoutes(): Promise<void> {
    const routes = await this.routeRepository.find({
      isActive: true,
    });

    for (const route of routes) {
      // TODO: set up class-validator for validation
      this.logger.debug(`setting up chat route ${JSON.stringify(route.definition)}`);
      await this.setUpChatRouteStream(route.definition as RouteDefinition);
    }
  }

  private async setUpChatRouteStream(definition: RouteDefinition) {
    const { src, dest } = definition;
    const srcComponent = this.setUpChatRouteComponent(src);
    const destComponent = this.setUpChatRouteComponent(dest);

    srcComponent.getRouteMessageObservable().subscribe(destComponent.routeMessageSubscriber());
    destComponent.getRouteMessageObservable().subscribe(srcComponent.routeMessageSubscriber());

    srcComponent.start();
    destComponent.start();
  }

  private setUpChatRouteComponent(component: RouteDefinitionComponent): ChatRoute {
    const { type, name } = component;

    switch (type) {
      case RouteType.WechatApp: {
        const wechatChatRoute: ChatRoute = new WechatChatRoute(this.wechatService, name);
        return wechatChatRoute;
      }
      case RouteType.RasaBot: {
        const rasaBot = this.rasaService.getInstance(name);
        const rasaChatRoute: ChatRoute = new RasaChatRoute(rasaBot);
        return rasaChatRoute;
      }
      default: {
        throw new Error(`unimplemented route definition component ${type}`);
      }
    }
  }
}
