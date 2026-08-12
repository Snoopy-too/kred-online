import { supabase } from './supabaseClient.js';
import { CalibrationDataSchema } from './lobbySchemas.js';

/**
 * Fetches the calibration record for a given player count from Supabase.
 * @param {number} numPlayers
 * @returns {Promise<{ hotspots: object, perspective_offsets: object }|null>}
 */
export async function fetchCalibrationFromDb(numPlayers) {
  try {
    const { data, error } = await supabase
      .from('kred_calibrations')
      .select('*')
      .eq('num_players', numPlayers)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching calibration from database:', error);
      return null;
    }

    if (!data) return null;

    // Validate using Zod schema for runtime integrity
    const parsed = CalibrationDataSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Validation failed for database calibration record:', parsed.error.format());
      return null;
    }

    return parsed.data;
  } catch (err) {
    console.error('Unexpected error in fetchCalibrationFromDb:', err);
    return null;
  }
}

/**
 * Saves the calibration record for a given player count to Supabase.
 * @param {number} numPlayers
 * @param {object} hotspots
 * @param {object} perspectiveOffsets
 * @returns {Promise<boolean>}
 */
export async function saveCalibrationToDb(numPlayers, hotspots, perspectiveOffsets) {
  try {
    const payload = {
      num_players: numPlayers,
      hotspots: hotspots || {},
      perspective_offsets: perspectiveOffsets || {}
    };

    // Validate using Zod schema
    const parsed = CalibrationDataSchema.safeParse(payload);
    if (!parsed.success) {
      console.error('Validation failed for saving calibration data:', parsed.error.format());
      throw new Error('Invalid calibration data format');
    }

    const { error } = await supabase
      .from('kred_calibrations')
      .upsert(
        {
          num_players: numPlayers,
          hotspots: hotspots || {},
          perspective_offsets: perspectiveOffsets || {},
          updated_at: new Date().toISOString()
        },
        { onConflict: 'num_players' }
      );

    if (error) {
      console.error('Error saving calibration to database:', error);
      throw error;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error in saveCalibrationToDb:', err);
    throw err;
  }
}

/**
 * Deletes the calibration record for a given player count from Supabase.
 * @param {number} numPlayers
 * @returns {Promise<boolean>}
 */
export async function deleteCalibrationFromDb(numPlayers) {
  try {
    const { error } = await supabase
      .from('kred_calibrations')
      .delete()
      .eq('num_players', numPlayers);

    if (error) {
      console.error('Error deleting calibration from database:', error);
      throw error;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error in deleteCalibrationFromDb:', err);
    throw err;
  }
}
