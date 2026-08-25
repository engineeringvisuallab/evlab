/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from 'react';
import { ThreeWorldCanvas } from './components/world/ThreeWorldCanvas';
import { GameHUD } from './components/game/GameHUD';
import { EngineeringObjectDetailModal } from './components/game/EngineeringObjectDetailModal';
import { TimeOfDay, WeatherType } from './types/game';
import { VehicleTypeId, VehiclePhysicsState } from './utils/vehicleController';
import { LandmarkZone } from './utils/miniCountryTerrain';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  // Game Play State
  const [isDriving, setIsDriving] = useState(true);
  const [canEnterVehicle, setCanEnterVehicle] = useState(false);
  const [vehicleType, setVehicleType] = useState<VehicleTypeId>('suv');
  const [vehicleState, setVehicleState] = useState<VehiclePhysicsState | null>(null);
  const [playerPosition, setPlayerPosition] = useState<[number, number]>([20, 50]);
  const [currentLandmark, setCurrentLandmark] = useState<LandmarkZone | null>(null);
  const [selectedEngineeringSite, setSelectedEngineeringSite] = useState<LandmarkZone | null>(null);

  // Camera & Environment
  const [cameraView, setCameraView] = useState<'chase' | 'hood' | 'orbit' | 'drone' | 'walk'>('chase');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [isMuted, setIsMuted] = useState(false);

  // Teleportation Target
  const [teleportTarget, setTeleportTarget] = useState<LandmarkZone | [number, number] | null>(null);

  // Vehicle action direct bindings (Honk, Lights, Reset)
  const vehicleActionRef = useRef<{
    honk: () => void;
    toggleHeadlights: () => void;
    resetVehicle: () => void;
  } | null>(null);

  const handleToggleDriveMode = useCallback(() => {
    setIsDriving((prev) => {
      const nextDriving = !prev;
      if (nextDriving) {
        setCameraView('chase');
      } else {
        setCameraView('walk');
        // Stop engine sound when exiting vehicle
        audioEngine.stopEngineSound();
      }
      return nextDriving;
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMute = !prev;
      audioEngine.setMuted(nextMute);
      return nextMute;
    });
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Main Interactive 3D WebGL Mini Country Canvas */}
      <ThreeWorldCanvas
        isDriving={isDriving}
        onToggleDriveMode={handleToggleDriveMode}
        vehicleType={vehicleType}
        timeOfDay={timeOfDay}
        weather={weather}
        cameraView={cameraView}
        onChangeCameraView={setCameraView}
        onVehicleStateUpdate={setVehicleState}
        onPlayerPositionUpdate={setPlayerPosition}
        onLandmarkEnter={setCurrentLandmark}
        onCanEnterVehicleChange={setCanEnterVehicle}
        onSelectEngineeringObject={(landmark) => setSelectedEngineeringSite(landmark)}
        teleportTarget={teleportTarget}
        onTeleportComplete={() => setTeleportTarget(null)}
        vehicleActionRef={vehicleActionRef}
      />

      {/* 2. Responsive Visualization HUD (Radar, Inspect Sites, Camera & Environment Controls) */}
      <GameHUD
        isDriving={isDriving}
        onToggleDriveMode={handleToggleDriveMode}
        canEnterVehicle={canEnterVehicle}
        vehicleType={vehicleType}
        onSelectVehicleType={(type) => {
          setVehicleType(type);
          audioEngine.playDoorThud();
        }}
        vehicleState={vehicleState}
        onHonk={() => vehicleActionRef.current?.honk()}
        onToggleHeadlights={() => vehicleActionRef.current?.toggleHeadlights()}
        onResetVehicle={() => vehicleActionRef.current?.resetVehicle()}
        cameraView={cameraView}
        onChangeCameraView={setCameraView}
        timeOfDay={timeOfDay}
        onSetTimeOfDay={setTimeOfDay}
        weather={weather}
        onSetWeather={setWeather}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        currentLandmark={currentLandmark}
        playerPosition={playerPosition}
        onTeleportToLandmark={(lm) => setTeleportTarget(lm)}
      />

      {/* 3. Detailed 3D Engineering Object Details Modal (Click to inspect site) */}
      {selectedEngineeringSite && (
        <EngineeringObjectDetailModal
          landmark={selectedEngineeringSite}
          onClose={() => setSelectedEngineeringSite(null)}
          onTeleportTo={(lm) => setTeleportTarget(lm)}
        />
      )}
    </main>
  );
}
