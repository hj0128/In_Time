import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User_Location } from './user-location.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  IUserLocationServiceCreate,
  IUserLocationServiceFindOneWithName,
  IUserLocationServiceFindUsersName,
  UserLocationInfo,
} from './user-location.interface';

@Injectable()
export class User_LocationService {
  constructor(
    @InjectRepository(User_Location)
    private readonly userLocationRepository: Repository<User_Location>, //

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findOneWithNameAndPlanID({
    name,
    planID,
  }: IUserLocationServiceFindOneWithName): Promise<User_Location> {
    return this.userLocationRepository.findOne({ where: { name, planID } });
  }

  async create({
    user,
    userLocationCreateDto,
  }: IUserLocationServiceCreate): Promise<User_Location> {
    const userLocation = await this.findOneWithNameAndPlanID({
      name: user.name,
      planID: userLocationCreateDto.planID,
    });

    let result: User_Location;
    if (userLocation) {
      result = await this.userLocationRepository.save({
        id: userLocation.id,
        name: user.name,
        ...userLocationCreateDto,
      });
    } else {
      result = await this.userLocationRepository.save({
        name: user.name,
        ...userLocationCreateDto,
        user: { id: user.id },
      });
    }

    await this.cacheManager.set(
      `${user.name}:${userLocationCreateDto.planID}`,
      { name: user.name, ...userLocationCreateDto },
      { ttl: 3600 },
    );

    return result;
  }

  async findWithUsersName({
    usersName,
    planID,
  }: IUserLocationServiceFindUsersName): Promise<UserLocationInfo[]> {
    if (!usersName) return [];

    const cacheLocation = [];
    await Promise.all(
      usersName.map(async (userName) => {
        const userLocation = await this.cacheManager.get(`${userName}:${planID}`);
        if (userLocation !== null) {
          cacheLocation.push(userLocation);
        }
      }),
    );
    if (cacheLocation) return cacheLocation;

    const dbLocation = await Promise.all(
      usersName.map(async (userName) => {
        const userLocation = await this.findOneWithNameAndPlanID({ name: userName, planID });

        await this.cacheManager.set(
          `${userName}:${planID}`,
          {
            name: userName,
            lat: userLocation.lat,
            lng: userLocation.lng,
            time: userLocation.time,
            isArrive: userLocation.isArrive,
            planID: userLocation.planID,
          },
          { ttl: 3600 },
        );

        return {
          name: userName,
          lat: userLocation.lat,
          lng: userLocation.lng,
          time: userLocation.time,
          isArrive: userLocation.isArrive,
          planID: userLocation.planID,
        };
      }),
    );

    return dbLocation;
  }
}
