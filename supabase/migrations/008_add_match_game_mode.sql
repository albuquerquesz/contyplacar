ALTER TABLE matches ADD COLUMN game_mode text NOT NULL DEFAULT 'first_arrival' CHECK (game_mode IN ('first_arrival', 'last_departure'));

ALTER TABLE invitations ADD COLUMN game_mode text NOT NULL DEFAULT 'first_arrival' CHECK (game_mode IN ('first_arrival', 'last_departure'));
