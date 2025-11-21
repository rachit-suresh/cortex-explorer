import { InterestNode } from '../types';

export const KNOWLEDGE_BASE_TREE: InterestNode[] = [
  {
    id: 'sports',
    label: 'Sports',
    type: 'category',
    children: [
      {
        id: 'racing',
        label: 'Racing',
        type: 'category',
        children: [
          {
            id: 'f1',
            label: 'Formula 1',
            type: 'category',
            children: [
              {
                id: 'f1-teams',
                label: 'Teams',
                type: 'category',
                children: [
                  {
                    id: 'ferrari',
                    label: 'Scuderia Ferrari',
                    type: 'entity',
                    children: [
                      { id: 'leclerc', label: 'Charles Leclerc', type: 'entity' },
                      { id: 'sainz', label: 'Carlos Sainz', type: 'entity' }
                    ]
                  },
                  {
                    id: 'redbull',
                    label: 'Red Bull Racing',
                    type: 'entity',
                    children: [
                      { id: 'verstappen', label: 'Max Verstappen', type: 'entity' },
                      { id: 'perez', label: 'Sergio Perez', type: 'entity' }
                    ]
                  },
                  {
                    id: 'mercedes',
                    label: 'Mercedes-AMG',
                    type: 'entity',
                    children: [
                      { id: 'hamilton', label: 'Lewis Hamilton', type: 'entity' },
                      { id: 'russell', label: 'George Russell', type: 'entity' }
                    ]
                  }
                ]
              },
              {
                id: 'f1-drivers',
                label: 'Drivers (All Time)',
                type: 'category',
                children: [
                  { id: 'senna', label: 'Ayrton Senna', type: 'entity' },
                  { id: 'schumacher', label: 'Michael Schumacher', type: 'entity' }
                ]
              }
            ]
          },
          {
            id: 'motogp',
            label: 'MotoGP',
            type: 'category',
            children: [
              { id: 'rossi', label: 'Valentino Rossi', type: 'entity' },
              { id: 'marquez', label: 'Marc Marquez', type: 'entity' }
            ]
          }
        ]
      },
      {
        id: 'basketball',
        label: 'Basketball',
        type: 'category',
        children: [
          {
            id: 'nba',
            label: 'NBA',
            type: 'category',
            children: [
              { id: 'lakers', label: 'LA Lakers', type: 'entity' },
              { id: 'warriors', label: 'Golden State Warriors', type: 'entity' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'movies',
    label: 'Movies',
    type: 'category',
    children: [
      {
        id: 'scifi',
        label: 'Sci-Fi',
        type: 'category',
        children: [
          { id: 'interstellar', label: 'Interstellar', type: 'entity' },
          { id: 'dune', label: 'Dune', type: 'entity' }
        ]
      },
      {
        id: 'directors',
        label: 'Directors',
        type: 'category',
        children: [
          { id: 'nolan', label: 'Christopher Nolan', type: 'entity' },
          { id: 'villeneuve', label: 'Denis Villeneuve', type: 'entity' }
        ]
      }
    ]
  },
  {
    id: 'music',
    label: 'Music',
    type: 'category',
    children: [
      {
        id: 'rock',
        label: 'Rock',
        type: 'category',
        children: [
          { id: 'pink-floyd', label: 'Pink Floyd', type: 'entity' },
          { id: 'led-zeppelin', label: 'Led Zeppelin', type: 'entity' }
        ]
      }
    ]
  }
];
