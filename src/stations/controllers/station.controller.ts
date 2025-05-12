import { NextFunction, Request, Response } from 'express';
import { stationService } from '../services';
import { AuthorizedRequest } from '@auth/types';
import { HttpCodes } from '@common/enums';
import { validateRequest } from '@common/utils';

class StationController {
  // Add station to favorites
  async addToFavorites(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      validateRequest(req);

      const { markerId } = req.params;
      const data = await stationService.addToFavorites(
        req.user.id,
        parseInt(markerId),
      );
      res.status(HttpCodes.Ok).json({ success: true, message: data.message });
    } catch (e: unknown) {
      console.error(e);
      next(e);
    }
  }

  // Remove station from favorites
  async removeFromFavorites(
    req: AuthorizedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      validateRequest(req);

      const { markerId } = req.params;
      const data = await stationService.removeFromFavorites(
        req.user.id,
        parseInt(markerId),
      );
      res.status(HttpCodes.Ok).json({ success: true, message: data.message });
    } catch (e: unknown) {
      console.error(e);
      next(e);
    }
  }

  // Create a new station
  async createNewStation(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequest(req);

      const stationData = req.body;
      const data = await stationService.createNewStation(stationData);
      res.status(HttpCodes.Created).json({ success: true, data });
    } catch (e: unknown) {
      console.error(e);
      next(e);
    }
  }

  // Delete a station by ID
  async deleteStation(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequest(req);

      const { stationId } = req.params;
      const data = await stationService.deleteStationById(parseInt(stationId));
      res.status(HttpCodes.Ok).json({ success: true, message: data.message });
    } catch (e: unknown) {
      console.error(e);
      next(e);
    }
  }

  // Get stations within a radius
  async getStationsNearby(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequest(req);

      const { latitude, longitude, radius } = req.query;
      const stations = await stationService.fetchStationsNearby(
        parseFloat(latitude as string) || 30.644,
        parseFloat(longitude as string) || 50.4501,
        parseInt(radius as string) || 21,
      );
      res.status(HttpCodes.Ok).json({ success: true, data: stations });
    } catch (e: unknown) {
      console.error(e);
      next(e);
    }
  }

  // Get station details by marker ID
  async getStationDetails(req: Request, res: Response, next: NextFunction) {
    try {
      validateRequest(req);

      const { markerId } = req.params;
      const station = await stationService.getStationDescription(
        parseInt(markerId),
      );
      res.status(HttpCodes.Ok).json({ success: true, data: station });
    } catch (e: unknown) {
      console.error(e);
      next(e);
    }
  }
}

export const stationController = new StationController();
