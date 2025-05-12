// __tests__/stationService.test.ts
import { StationService } from '../src/stations/services';
import { prisma } from '@database';

jest.mock('@database', () => ({
  prisma: {
    savedStations: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    station_description: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    station_marker: {
      findMany: jest.fn(),
    },
  },
}));

describe('StationService', () => {
  const service = new StationService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('додавання у вподобання (addToFavorites)', () => {
    const userId = 1;
    const markerId = 42;

    it('успішно додає станцію, якщо її ще немає', async () => {
      (prisma.savedStations.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.savedStations.create as jest.Mock).mockResolvedValue({
        userId,
        markerId,
      });

      const result = await service.addToFavorites(userId, markerId);

      expect(prisma.savedStations.findUnique).toHaveBeenCalledWith({
        where: { userId_markerId: { userId, markerId } },
      });
      expect(prisma.savedStations.create).toHaveBeenCalledWith({
        data: { userId, markerId },
      });
      expect(result).toEqual({ message: 'Station added to favorites' });
    });

    it('кидає помилку, якщо станція вже є у вподобаннях', async () => {
      (prisma.savedStations.findUnique as jest.Mock).mockResolvedValue({
        userId,
        markerId,
      });

      await expect(service.addToFavorites(userId, markerId)).rejects.toThrow(
        'Station is already in your favorites',
      );

      expect(prisma.savedStations.create).not.toHaveBeenCalled();
    });
  });

  describe('видалення з вподобань (removeFromFavorites)', () => {
    const userId = 2;
    const markerId = 99;

    it('успішно видаляє станцію з вподобань', async () => {
      (prisma.savedStations.delete as jest.Mock).mockResolvedValue({
        userId,
        markerId,
      });

      const result = await service.removeFromFavorites(userId, markerId);

      expect(prisma.savedStations.delete).toHaveBeenCalledWith({
        where: { userId_markerId: { userId, markerId } },
      });
      expect(result).toEqual({ message: 'Station removed from favorites' });
    });
  });

  describe('створення нової станції (createNewStation)', () => {
    const stationData = {
      stationName: 'Test Station',
      locationName: 'Test Location',
      locationType: 'Urban',
      isSupportCharging: true,
      isSupportReservation: false,
      countryCode: 'UA',
      longitude: 30.5,
      latitude: 50.4,
    };
    const fakeStation = { description_id: 123, ...stationData };

    it('створює нову станцію та повертає її', async () => {
      (prisma.station_description.create as jest.Mock).mockResolvedValue(
        fakeStation,
      );

      const result = await service.createNewStation(stationData);

      expect(prisma.station_description.create).toHaveBeenCalledWith({
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
      expect(result).toEqual(fakeStation);
    });
  });

  describe('видалення станції (deleteStationById)', () => {
    const stationId = 77;

    it('успішно видаляє існуючу станцію', async () => {
      (prisma.station_description.findUnique as jest.Mock).mockResolvedValue({
        description_id: stationId,
      });
      (prisma.station_description.delete as jest.Mock).mockResolvedValue({
        description_id: stationId,
      });

      const result = await service.deleteStationById(stationId);

      expect(prisma.station_description.findUnique).toHaveBeenCalledWith({
        where: { description_id: stationId },
      });
      expect(prisma.station_description.delete).toHaveBeenCalledWith({
        where: { description_id: stationId },
      });
      expect(result).toEqual({ message: 'Station deleted successfully' });
    });

    it('кидає помилку, якщо станція не знайдена', async () => {
      (prisma.station_description.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.deleteStationById(stationId)).rejects.toThrow(
        'Station not found',
      );

      expect(prisma.station_description.delete).not.toHaveBeenCalled();
    });
  });

  describe('отримання маркерів поруч (fetchStationsNearby)', () => {
    const lat = 50;
    const lng = 30;
    const radius = 0.1;
    const fakeMarkers = [{ id: 1 }, { id: 2 }];

    it('повертає маркери в межах радіусу', async () => {
      (prisma.station_marker.findMany as jest.Mock).mockResolvedValue(
        fakeMarkers,
      );

      const result = await service.fetchStationsNearby(lat, lng, radius);

      expect(prisma.station_marker.findMany).toHaveBeenCalledWith({
        where: {
          latitude: { gte: lat - radius, lte: lat + radius },
          longitude: { gte: lng - radius, lte: lng + radius },
        },
        include: {
          station_description: {
            include: { comments: true, station_connector: true, images: true },
          },
        },
      });
      expect(result).toEqual(fakeMarkers);
    });
  });

  describe('отримання опису станції (getStationDescription)', () => {
    const markerId = 55;
    const fakeDesc = { station_id: markerId, station_name: 'X' };

    it('успішно повертає опис станції', async () => {
      (prisma.station_description.findFirst as jest.Mock).mockResolvedValue(
        fakeDesc,
      );

      const result = await service.getStationDescription(markerId);

      expect(prisma.station_description.findFirst).toHaveBeenCalledWith({
        where: { station_id: markerId },
        include: { station_connector: true, images: true, comments: true },
      });
      expect(result).toEqual(fakeDesc);
    });

    it('кидає помилку, якщо опис не знайдено', async () => {
      (prisma.station_description.findFirst as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.getStationDescription(markerId)).rejects.toThrow(
        'Station not found',
      );
    });
  });
});
