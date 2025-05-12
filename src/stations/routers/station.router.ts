import { Router } from 'express';
import { stationController } from '../controllers';
import { auth } from '@auth/middlewares';

export const stationRouter = Router();

// Route to add a station to favorites
stationRouter.post(
  '/favorite/:markerId',
  auth,
  stationController.addToFavorites,
);

// Route to remove a station from favorites
stationRouter.delete(
  '/favorite/:markerId',
  auth,
  stationController.removeFromFavorites,
);

// Route to create a new station
stationRouter.post('/new', auth, stationController.createNewStation);

// Route to delete a station by ID
stationRouter.delete('/one/:stationId', auth, stationController.deleteStation);

// Route to fetch stations within a radius
stationRouter.get('/radius', stationController.getStationsNearby);

// Route to fetch station details by marker ID
stationRouter.get('/one/:markerId', stationController.getStationDetails);
