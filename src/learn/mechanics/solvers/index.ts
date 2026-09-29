import { CalculationStep, ValidationFlag } from '../types/mechanics';
import { solveBeamSystem } from './beamSolver';
import { solveCompositeCentroid, ShapeElement } from './centroidSolver';
import { solveWorkEnergy } from './energySolver';
import { solveBeamEquilibrium } from './equilibriumSolver';
import { solveFBD, AppliedForce } from './fbdSolver';
import { solveFriction } from './frictionSolver';
import { solveKinematics } from './kinematicsSolver';
import { solveSliderCrank } from './mechanismSolver';
import { solveMomentOfForce } from './momentSolver';
import { solveCollision } from './momentumSolver';
import { solveNewton2ndLaw } from './newtonSolver';
import { solveProjectileMotion } from './projectileSolver';
import { solveRotationalDynamics } from './rotationSolver';
import { solveStandardTruss } from './trussSolver';
import { solveVectorSystem } from './vectorSolver';

export interface SolvedTopicData {
  computedData: Record<string, any>;
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
}

export function solveTopicMechanics(
  topicId: string,
  params: Record<string, number>
): SolvedTopicData {
  switch (topicId) {
    case 'vectors': {
      const f1Mag = params.f1Mag ?? 150;
      const f1Angle = params.f1Angle ?? 30;
      const f2Mag = params.f2Mag ?? 200;
      const f2Angle = params.f2Angle ?? 120;
      const f3Mag = params.f3Mag ?? 0;
      const f3Angle = params.f3Angle ?? 0;

      const res = solveVectorSystem(f1Mag, f1Angle, f2Mag, f2Angle, f3Mag, f3Angle);
      return {
        computedData: {
          resultantX: res.resultantX,
          resultantY: res.resultantY,
          resultantMagnitude: res.resultantMagnitude,
          resultantAngleDeg: res.resultantAngleDeg,
          vectors: res.vectors,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'fbd': {
      const mass = params.bodyMass ?? 20;
      const appliedForce = params.appliedForce ?? 150;
      const appliedAngle = params.appliedAngle ?? 35;
      const appliedX = params.appliedX ?? 1.2;
      const appliedY = params.appliedY ?? 0.5;

      const forces: AppliedForce[] = [
        {
          id: 'W',
          name: 'Weight',
          magnitude: mass * 9.81,
          angleDeg: 270,
          posX: 0,
          posY: 0,
          type: 'weight',
        },
        {
          id: 'N',
          name: 'Normal Force',
          magnitude: mass * 9.81 - appliedForce * Math.sin((appliedAngle * Math.PI) / 180),
          angleDeg: 90,
          posX: 0,
          posY: -0.5,
          type: 'normal',
        },
        {
          id: 'F_app',
          name: 'Applied Force',
          magnitude: appliedForce,
          angleDeg: appliedAngle,
          posX: appliedX,
          posY: appliedY,
          type: 'applied',
        },
        {
          id: 'f_fric',
          name: 'Friction',
          magnitude: Math.abs(appliedForce * Math.cos((appliedAngle * Math.PI) / 180)),
          angleDeg: 180,
          posX: 0,
          posY: -0.5,
          type: 'friction',
        },
      ];

      const res = solveFBD(mass, forces, 0, 0);
      return {
        computedData: {
          sumFx: res.sumFx,
          sumFy: res.sumFy,
          sumMomentOrigin: res.sumMomentOrigin,
          isEquilibrium: res.isEquilibrium,
          forces,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'moment': {
      const forceMag = params.forceMag ?? 120;
      const forceAngleDeg = params.forceAngleDeg ?? 60;
      const leverLength = params.leverLength ?? 2.5;
      const applicationPosition = params.applicationPosition ?? 2.0;

      const res = solveMomentOfForce(forceMag, forceAngleDeg, leverLength, applicationPosition);
      return {
        computedData: {
          moment: res.moment,
          perpendicularDistance: res.perpendicularDistance,
          fx: res.fx,
          fy: res.fy,
          direction: res.direction,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'equilibrium': {
      const spanL = params.spanL ?? 6.0;
      const pointLoadP = params.pointLoadP ?? 400;
      const pointLoadPos = params.pointLoadPos ?? 2.0;
      const udlW = params.udlW ?? 50;
      const supportBPos = params.supportBPos ?? 6.0;

      const res = solveBeamEquilibrium(spanL, 'pin', 'roller', supportBPos, pointLoadP, pointLoadPos, udlW);
      return {
        computedData: {
          raX: res.raX,
          raY: res.raY,
          rbY: res.rbY,
          ma: res.ma,
          isStaticallyDeterminate: res.isStaticallyDeterminate,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'friction': {
      const mass = params.mass ?? 10;
      const appliedForce = params.appliedForce ?? 45;
      const inclineAngleDeg = params.inclineAngleDeg ?? 15;
      const muS = params.muS ?? 0.50;
      const muK = params.muK ?? 0.35;

      const res = solveFriction(mass, appliedForce, inclineAngleDeg, muS, muK);
      return {
        computedData: {
          weight: res.weight,
          normalForce: res.normalForce,
          maxStaticFriction: res.maxStaticFriction,
          kineticFriction: res.kineticFriction,
          actualFriction: res.actualFriction,
          netDrivingForce: res.netDrivingForce,
          state: res.state,
          acceleration: res.acceleration,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'centroid': {
      const fw = params.flangeWidth ?? 300;
      const ft = params.flangeThickness ?? 25;
      const wh = params.webHeight ?? 350;
      const wt = params.webThickness ?? 20;

      const elements: ShapeElement[] = [
        {
          id: 'flange',
          name: 'Top Flange',
          type: 'rectangle',
          width: fw,
          height: ft,
          posX: -fw / 2,
          posY: wh,
        },
        {
          id: 'web',
          name: 'Vertical Web',
          type: 'rectangle',
          width: wt,
          height: wh,
          posX: -wt / 2,
          posY: 0,
        },
      ];

      const res = solveCompositeCentroid(elements);
      return {
        computedData: {
          totalArea: res.totalArea,
          centroidX: res.centroidX,
          centroidY: res.centroidY,
          ixx: res.ixx,
          iyy: res.iyy,
          elements: res.elements,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'beams': {
      const length = params.beamLength ?? 6.0;
      const p1 = params.loadP1 ?? 500;
      const p1Pos = params.loadP1Pos ?? 2.0;
      const p2 = params.loadP2 ?? 300;
      const p2Pos = params.loadP2Pos ?? 4.5;
      const udlW = params.udlW ?? 40;
      const eGpa = params.eGpa ?? 200;
      const iCm4 = params.iCm4 ?? 1500;

      const pointLoads = [];
      if (p1 > 0) pointLoads.push({ id: 'P1', position: p1Pos, magnitude: p1 });
      if (p2 > 0) pointLoads.push({ id: 'P2', position: p2Pos, magnitude: p2 });

      const udls = [];
      if (udlW > 0) udls.push({ id: 'UDL1', startPos: 0, endPos: length, w: udlW });

      const res = solveBeamSystem(length, 'simply_supported', pointLoads, udls, length, eGpa, iCm4);
      return {
        computedData: {
          length: res.length,
          raY: res.reactions.raY,
          rbY: res.reactions.rbY,
          maxShear: res.maxShear,
          maxMoment: res.maxMoment,
          maxDeflection: res.maxDeflection,
          stations: res.stations,
          diagramPoints: res.stations.map((s) => ({
            x: s.x,
            shearV: s.shear,
            momentM: s.moment,
            deflectionV: s.deflection,
          })),
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'trusses': {
      const span = params.trussSpan ?? 6.0;
      const height = params.trussHeight ?? 2.5;
      const load = params.jointLoadN ?? 1200;

      const res = solveStandardTruss(span, height, load);
      return {
        computedData: {
          nodes: res.nodes,
          members: res.members,
          reactions: res.reactions,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'kinematics': {
      const s0 = params.s0 ?? 0;
      const v0 = params.v0 ?? 10;
      const a = params.accel ?? 2.5;
      const dur = params.simDuration ?? 6;

      const res = solveKinematics(s0, v0, a, dur);
      return {
        computedData: {
          finalPosition: res.finalPosition,
          finalVelocity: res.finalVelocity,
          totalTime: res.totalTime,
          samples: res.samples,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'projectile': {
      const v0 = params.launchV0 ?? 25;
      const ang = params.launchAngle ?? 45;
      const y0 = params.launchY0 ?? 2.0;
      const g = params.gravityG ?? 9.81;

      const res = solveProjectileMotion(v0, ang, y0, g);
      return {
        computedData: {
          timeOfFlight: res.timeOfFlight,
          rangeX: res.rangeX,
          maxHeightY: res.maxHeightY,
          timeToApex: res.timeToApex,
          landingVelocity: res.landingVelocity,
          landingAngleDeg: res.landingAngleDeg,
          trajectory: res.trajectory,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'newton': {
      const mass = params.massKg ?? 12;
      const force = params.forceN ?? 60;
      const muK = params.frictionMuK ?? 0.20;

      const res = solveNewton2ndLaw(mass, force, muK);
      return {
        computedData: {
          mass: res.mass,
          appliedForce: res.appliedForce,
          frictionForce: res.frictionForce,
          netForce: res.netForce,
          acceleration: res.acceleration,
          weight: res.weight,
          normalForce: res.normalForce,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'energy': {
      const mass = params.massKg ?? 8;
      const h = params.initialHeightM ?? 5.0;
      const v0 = params.initialVelocityMs ?? 2.0;
      const loss = params.frictionLossN ?? 4.0;

      const res = solveWorkEnergy(mass, h, v0, loss, h);
      return {
        computedData: {
          mass: res.mass,
          initialHeight: res.initialHeight,
          initialVelocity: res.initialVelocity,
          kineticEnergyInitial: res.kineticEnergyInitial,
          potentialEnergyInitial: res.potentialEnergyInitial,
          totalMechanicalEnergy: res.totalMechanicalEnergy,
          finalVelocityAtBottom: res.finalVelocityAtBottom,
          frictionWorkLost: res.frictionWorkLost,
          powerAverage: res.powerAverage,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'momentum': {
      const m1 = params.m1 ?? 4;
      const u1 = params.u1 ?? 6;
      const m2 = params.m2 ?? 2;
      const u2 = params.u2 ?? -2;
      const e = params.restitutionE ?? 0.85;

      const res = solveCollision(m1, u1, m2, u2, e);
      return {
        computedData: {
          m1: res.m1,
          m2: res.m2,
          u1: res.u1,
          u2: res.u2,
          v1: res.v1,
          v2: res.v2,
          e: res.e,
          initialTotalMomentum: res.initialTotalMomentum,
          finalTotalMomentum: res.finalTotalMomentum,
          initialKineticEnergy: res.initialKineticEnergy,
          finalKineticEnergy: res.finalKineticEnergy,
          energyLoss: res.energyLoss,
          impulse: res.impulse,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'rotation': {
      const mass = params.massKg ?? 15;
      const r = params.radiusM ?? 0.40;
      const tau = params.torqueNm ?? 25;
      const dur = params.simDurationS ?? 5;

      const res = solveRotationalDynamics('solid_cylinder', mass, r, tau, 0, dur);
      return {
        computedData: {
          momentOfInertia: res.momentOfInertia,
          torque: res.torque,
          angularAcceleration: res.angularAcceleration,
          finalAngularVelocity: res.finalAngularVelocity,
          rotationalKineticEnergy: res.rotationalKineticEnergy,
          rpm: res.rpm,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    case 'mechanisms': {
      const r = params.crankRadiusR ?? 0.08;
      const l = params.connectingRodL ?? 0.24;
      const rpm = params.crankOmegaRpm ?? 1200;
      const theta = params.crankAngleDeg ?? 45;
      const omega = (rpm * 2 * Math.PI) / 60;

      const res = solveSliderCrank(r, l, omega, theta);
      return {
        computedData: {
          crankRadiusR: res.crankRadiusR,
          connectingRodL: res.connectingRodL,
          crankOmegaRadS: res.crankOmegaRadS,
          pistonPositionX: res.pistonPositionX,
          pistonVelocityVx: res.pistonVelocityVx,
          pistonAccelerationAx: res.pistonAccelerationAx,
        },
        steps: res.steps,
        validations: res.validations,
        interpretation: res.interpretation,
      };
    }

    default:
      return {
        computedData: {},
        steps: [],
        validations: [],
        interpretation: 'Topic simulation loaded.',
      };
  }
}
