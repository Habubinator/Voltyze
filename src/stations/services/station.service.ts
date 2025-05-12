import { prisma } from '@database';
import { comments } from '../../../generated/prisma/index';

class StationService {
  // Додавання станції до улюблених
  async addToFavorites(userId: number, markerId: number) {
    const existingFavorite = await prisma.savedStations.findUnique({
      where: { userId_markerId: { userId, markerId } },
    });

    if (existingFavorite) {
      throw new Error('Station is already in your favorites');
    }

    await prisma.savedStations.create({
      data: { userId, markerId },
    });

    return { message: 'Station added to favorites' };
  }

  // Видалення станції з улюблених
  async removeFromFavorites(userId: number, markerId: number) {
    await prisma.savedStations.delete({
      where: { userId_markerId: { userId, markerId } },
    });

    return { message: 'Station removed from favorites' };
  }

  // Створення нової станції
  async createNewStation(stationData: any) {
    const station = await prisma.station_description.create({
      data: {
        station_name: stationData.stationName,
        location_name: stationData.locationName,
        location_type: stationData.locationType,
        is_support_charging: stationData.isSupportCharging,
        is_support_reservation: stationData.isSupportReservation,
        country_code: stationData.countryCode,
        station_marker: {
          create: {
            longitude: stationData.longitude,
            latitude: stationData.latitude,
          },
        },
      },
    });
    return station;
  }

  // Видалення станції
  async deleteStationById(stationId: number) {
    const station = await prisma.station_description.findUnique({
      where: { description_id: stationId },
    });

    if (!station) {
      throw new Error('Station not found');
    }

    await prisma.station_description.delete({
      where: { description_id: stationId },
    });

    return { message: 'Station deleted successfully' };
  }

  // Отримання станцій в радіусі
  async fetchStationsNearby(lat: number, lng: number, radius: number) {
    const stations = await prisma.station_marker.findMany({
      where: {
        latitude: {
          gte: lat - radius,
          lte: lat + radius,
        },
        longitude: {
          gte: lng - radius,
          lte: lng + radius,
        },
        // station_description: {
        //   some: {
        //     comments: {
        //       some: {
        //         description_id: {
        //           not: null,
        //         },
        //       },
        //     },
        //   },
        // },
      },
      include: {
        station_description: {
          include: { comments: true, station_connector: true, images: true },
        },
      },
    });
    return stations;
  }

  // Отримання опису станції
  async getStationDescription(markerId: number) {
    const station = await prisma.station_description.findFirst({
      where: { station_id: markerId },
      include: {
        station_connector: true,
        images: true,
        comments: true,
      },
    });

    if (!station) {
      throw new Error('Station not found');
    }

    return station;
  }
}

export const stationService = new StationService();
