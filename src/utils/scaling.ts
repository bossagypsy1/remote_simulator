/**
 * Shared scaling utilities for raw-signal simulation.
 * All simulated industrial sensors use a 4-20 mA current loop.
 *
 * To convert an engineering value to the raw mA signal:
 *   raw = signal_min + (scaled - value_min) / (value_max - value_min) * (signal_max - signal_min)
 *
 * The ingest server applies the inverse to recover the engineering value.
 */

export interface ScalingConfig {
  signalMin: number;  // mA floor  (4)
  signalMax: number;  // mA ceiling (20)
  valueMin:  number;  // engineering minimum
  valueMax:  number;  // engineering maximum
}

/** Convert an already-scaled engineering value to its raw mA signal. */
export function toRaw(scaled: number, cfg: ScalingConfig): number {
  return cfg.signalMin
    + (scaled - cfg.valueMin) / (cfg.valueMax - cfg.valueMin)
    * (cfg.signalMax - cfg.signalMin);
}

// ── EnvBox (ENV-100) — 4-20 mA ───────────────────────────────────────────────
export const ENV_SCALING = {
  temperature: { signalMin: 4, signalMax: 20, valueMin: -20,  valueMax: 60   }, // °C
  pressure:    { signalMin: 4, signalMax: 20, valueMin:  950, valueMax: 1060  }, // hPa
  humidity:    { signalMin: 4, signalMax: 20, valueMin:  0,   valueMax: 100   }, // %
  acidity:     { signalMin: 4, signalMax: 20, valueMin:  0,   valueMax: 14    }, // pH
  vibration:   { signalMin: 4, signalMax: 20, valueMin:  0,   valueMax: 50    }, // mm/s
  motor_temperature: { signalMin: 4, signalMax: 20, valueMin: 0, valueMax: 120 }, // C
  power_draw:  { signalMin: 4, signalMax: 20, valueMin:  0,   valueMax: 500   }, // kW
  air_quality_voc: { signalMin: 4, signalMax: 20, valueMin: 0, valueMax: 2000 }, // ppm
  particulate_matter: { signalMin: 4, signalMax: 20, valueMin: 0, valueMax: 500 }, // ug/m3
  line_pressure: { signalMin: 4, signalMax: 20, valueMin: 0, valueMax: 16 }, // bar
  noise_level: { signalMin: 4, signalMax: 20, valueMin: 40, valueMax: 120 }, // dB
  co2_level: { signalMin: 4, signalMax: 20, valueMin: 350, valueMax: 5000 }, // ppm
  cold_room_temperature: { signalMin: 4, signalMax: 20, valueMin: -30, valueMax: 20 }, // C
  coolant_temperature: { signalMin: 4, signalMax: 20, valueMin: -10, valueMax: 80 }, // C
} satisfies Record<string, ScalingConfig>;

// ── Fuel Monitor (FM-100) — 4-20 mA ─────────────────────────────────────────
export const FUEL_SCALING = {
  tank_level:       { signalMin: 4, signalMax: 20, valueMin:  0,  valueMax: 100 }, // %
  tank_temperature: { signalMin: 4, signalMax: 20, valueMin: -10, valueMax: 80  }, // °C
  tank_pressure:    { signalMin: 4, signalMax: 20, valueMin:  0,  valueMax: 10  }, // bar
} satisfies Record<string, ScalingConfig>;
