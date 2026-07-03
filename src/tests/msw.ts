import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import {
  forecastFixture,
  geocodingFixture,
  nominatimReverseFixture,
  nominatimSearchFixture
} from './fixtures';

export const handlers = [
  http.get('https://geocoding-api.open-meteo.com/v1/search', () =>
    HttpResponse.json(geocodingFixture)
  ),
  http.get('https://api.open-meteo.com/v1/forecast', () => HttpResponse.json(forecastFixture)),
  http.get('https://nominatim.openstreetmap.org/reverse', () =>
    HttpResponse.json(nominatimReverseFixture)
  ),
  http.get('https://nominatim.openstreetmap.org/search', () =>
    HttpResponse.json(nominatimSearchFixture)
  )
];

export const server = setupServer(...handlers);
