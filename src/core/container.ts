/**
 * container.ts
 *
 * Instâncias únicas (singletons) de todos os repositórios e use cases.
 * Importe daqui em vez de criar `new X()` dentro de hooks ou componentes.
 *
 * Benefícios:
 *  - Evita recriação a cada render/mount
 *  - Facilita troca de implementação (ex: mock em testes)
 *  - Ponto único de verdade para dependências
 */

// ─── Repositórios ─────────────────────────────────────────────────────────────

import { ApiAuthRepository } from "@/core/data/repositories/auth/ApiAuthRepository";
import { ApiRefreshDatasetRepository } from "@/core/data/repositories/refresh/ApiRefreshDatasetRepository";
import { ApiReportsAdminRepository } from "@/core/data/repositories/reports/ApiReportsAdminRepository";
import { ApiReportsRepository } from "@/core/data/repositories/reports/ApiReportsRepository";
import { ApiScheduleReportsRepository } from "@/core/data/repositories/schedules/ApiScheduleReportsRepository";
import { ApiUsersRepository } from "@/core/data/repositories/users/ApiUsersRepository";

export const authRepository = new ApiAuthRepository();
export const reportsRepository = new ApiReportsRepository();
export const reportsAdminRepository = new ApiReportsAdminRepository();
export const usersRepository = new ApiUsersRepository();
export const scheduleReportsRepository = new ApiScheduleReportsRepository();
export const refreshDatasetRepository = new ApiRefreshDatasetRepository();

// ─── Use Cases: Auth ──────────────────────────────────────────────────────────

import { LoginUseCase } from "@/core/domain/use-cases/LoginUseCase";

export const loginUseCase = new LoginUseCase(authRepository);

// ─── Use Cases: Usuários ──────────────────────────────────────────────────────

import { ActivateUserUseCase } from "@/core/domain/use-cases/ActivateUserUseCase";
import { CreateUserUseCase } from "@/core/domain/use-cases/CreateUserUseCase";
import { DeactivateUserUseCase } from "@/core/domain/use-cases/DeactivateUserUseCase";
import { DeleteUserUseCase } from "@/core/domain/use-cases/DeleteUserUseCase";
import { GetAllUsersUseCase } from "@/core/domain/use-cases/GetAllUsersUseCase";
import { GetProfileUseCase } from "@/core/domain/use-cases/GetProfileUseCase";
import { UpdateUserUseCase } from "@/core/domain/use-cases/UpdateUserUseCase";

export const getAllUsersUseCase = new GetAllUsersUseCase(usersRepository);
export const getProfileUseCase = new GetProfileUseCase(usersRepository);
export const createUserUseCase = new CreateUserUseCase(usersRepository);
export const updateUserUseCase = new UpdateUserUseCase(usersRepository);
export const activateUserUseCase = new ActivateUserUseCase(usersRepository);
export const deactivateUserUseCase = new DeactivateUserUseCase(usersRepository);
export const deleteUserUseCase = new DeleteUserUseCase(usersRepository);

// ─── Use Cases: Relatórios ────────────────────────────────────────────────────

import { GetAllReportsUseCase } from "@/core/domain/use-cases/GetAllReportsUseCase";
import { GetReportByIdUseCase } from "@/core/domain/use-cases/GetReportByIdUseCase";
import {
  ActivateReportUseCase,
  CheckRefreshStatusUseCase,
  CreateScheduleReportUseCase,
  DeactivateReportUseCase,
  DeleteReportUseCase,
  DeleteScheduleReportUseCase,
  GetAllSchedulesUseCase,
  GetScheduleByReportUseCase,
  RefreshDatasetUseCase,
  SyncReportsUseCase,
  UpdateScheduleReportUseCase,
} from "@/core/domain/use-cases/ReportsManagementUseCases";
import { RevokeReportUseCase } from "@/core/domain/use-cases/RevokeReportUseCase";
import { ShareReportUseCase } from "@/core/domain/use-cases/ShareReportUseCase";

export const getAllReportsUseCase = new GetAllReportsUseCase(reportsRepository);
export const getReportByIdUseCase = new GetReportByIdUseCase(reportsRepository);
export const shareReportUseCase = new ShareReportUseCase(reportsRepository);
export const revokeReportUseCase = new RevokeReportUseCase(reportsRepository);

export const syncReportsUseCase = new SyncReportsUseCase(
  reportsAdminRepository,
);
export const activateReportUseCase = new ActivateReportUseCase(
  reportsAdminRepository,
);
export const deactivateReportUseCase = new DeactivateReportUseCase(
  reportsAdminRepository,
);
export const deleteReportUseCase = new DeleteReportUseCase(
  reportsAdminRepository,
);

export const refreshDatasetUseCase = new RefreshDatasetUseCase(
  refreshDatasetRepository,
);
export const checkRefreshStatusUseCase = new CheckRefreshStatusUseCase(
  refreshDatasetRepository,
);

export const getAllSchedulesUseCase = new GetAllSchedulesUseCase(
  scheduleReportsRepository,
);
export const getScheduleByReportUseCase = new GetScheduleByReportUseCase(
  scheduleReportsRepository,
);
export const createScheduleReportUseCase = new CreateScheduleReportUseCase(
  scheduleReportsRepository,
);
export const updateScheduleReportUseCase = new UpdateScheduleReportUseCase(
  scheduleReportsRepository,
);
export const deleteScheduleReportUseCase = new DeleteScheduleReportUseCase(
  scheduleReportsRepository,
);
