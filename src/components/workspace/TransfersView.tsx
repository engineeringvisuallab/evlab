/**
 * EV Software Core - Data Exchange (Transfers) Console
 * Implements the 6-stage Transfer Lifecycle, deep structural diff inspection,
 * technical validation execution, review notes, and explicit commit / reject controls.
 */

import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  FileCode,
  Eye,
  Check,
  X,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useCore } from '../../core/store/coreStore';
import { Transfer, TransferState } from '../../types/transfer';
import { Badge } from '../common/Badge';
import { DiffViewer } from '../common/DiffViewer';

export const TransfersView: React.FC = () => {
  const {
    transfers,
    updateTransferState,
    commitTransfer,
    resolveTransferConflict,
    activeProject,
    datasets,
    currentUser,
  } = useCore();

  const projectTransfers = transfers.filter((t) => !activeProject || t.projectId === activeProject.projectId);
  const [selectedTransferId, setSelectedTransferId] = useState<string>(
    projectTransfers[0]?.transferId || ''
  );
  const [reviewerNotes, setReviewerNotes] = useState<string>('Reviewed spatial alignment and hydraulic diameter sizing against civil corridor constraints. Approved for commit.');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const selectedTransfer = transfers.find((t) => t.transferId === selectedTransferId);

  const LIFECYCLE_STAGES: TransferState[] = [
    'prepared',
    'sent',
    'imported',
    'reviewed',
    'validated',
    'committed',
  ];

  const getStageIndex = (state: TransferState) => {
    if (state === 'rejected') return -1;
    return LIFECYCLE_STAGES.indexOf(state);
  };

  // State Transition Handlers
  const handleAdvanceToState = async (nextState: TransferState) => {
    if (!selectedTransfer) return;
    setIsProcessing(true);
    try {
      await updateTransferState(selectedTransfer.transferId, nextState, {
        notes: reviewerNotes,
      });
      setFeedbackMessage(`Transfer successfully advanced to state: '${nextState}'`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      alert(`State transition error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Commit Transfer Handler
  const handleCommit = async () => {
    if (!selectedTransfer) return;
    setIsProcessing(true);
    try {
      const newRev = await commitTransfer(selectedTransfer.transferId, reviewerNotes);
      setFeedbackMessage(
        `Transfer Committed! Created Revision #${newRev.newRevision.revisionNumber} [Checksum: ${newRev.newRevision.payloadChecksum.slice(0, 10)}...]`
      );
      setTimeout(() => setFeedbackMessage(null), 6000);
    } catch (err: any) {
      alert(`Commit error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject Transfer Handler
  const handleReject = async () => {
    if (!selectedTransfer) return;
    const reason = prompt('Please provide a reason for rejecting this transfer package:', 'Hydraulic velocity exceeded design limits.');
    if (!reason) return;
    setIsProcessing(true);
    try {
      await updateTransferState(selectedTransfer.transferId, 'rejected', {
        notes: `Rejected by ${currentUser.name}: ${reason}`,
      });
      setFeedbackMessage('Transfer package marked as REJECTED.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err: any) {
      alert(`Reject error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentStageIndex = selectedTransfer ? getStageIndex(selectedTransfer.state) : -1;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Data Exchange Console</h1>
            <Badge variant="primary">{projectTransfers.length} Transfers in Project</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manages controlled, non-destructive data transfers between sibling engineering apps with explicit review and commit stages.
          </p>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-400 hover:text-emerald-200">✕</button>
        </div>
      )}

      {/* Main Layout: Left Transfer List & Right Lifecycle Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Transfer List */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
            Exchange Packages
          </div>

          <div className="space-y-2">
            {projectTransfers.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs bg-slate-900 rounded-xl border border-slate-800 p-4">
                No transfer packages created in this project yet. Use the Proving Bench or Sibling Apps to start a transfer.
              </div>
            ) : (
              projectTransfers.map((trf) => {
                const isSelected = trf.transferId === selectedTransferId;
                return (
                  <div
                    key={trf.transferId}
                    onClick={() => setSelectedTransferId(trf.transferId)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-slate-900 border-blue-500 shadow-md ring-1 ring-blue-500/20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-medium text-slate-200">
                        <span className="text-blue-400">{trf.sourceApplicationId.replace('app-', '')}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-emerald-400">{trf.destinationApplicationId.replace('app-', '')}</span>
                      </div>
                      <Badge
                        variant={
                          trf.state === 'committed'
                            ? 'success'
                            : trf.state === 'validated'
                            ? 'info'
                            : trf.state === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {trf.state}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {trf.package.changeSummary}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                      <span>ID: {trf.transferId}</span>
                      <span>{new Date(trf.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Transfer Lifecycle & Diff Console */}
        {selectedTransfer ? (
          <div className="lg:col-span-8 space-y-5">
            {/* Top Card: Lifecycle Stage Stepper */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-blue-400">
                    TRANSFER PACKAGE: {selectedTransfer.transferId}
                  </span>
                  <h2 className="text-base font-bold text-slate-100 mt-0.5">
                    {selectedTransfer.package.changeSummary}
                  </h2>
                </div>

                <Badge
                  size="md"
                  variant={
                    selectedTransfer.state === 'committed'
                      ? 'success'
                      : selectedTransfer.state === 'validated'
                      ? 'info'
                      : selectedTransfer.state === 'rejected'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  STATE: {selectedTransfer.state}
                </Badge>
              </div>

              {/* 6-Stage Visual Stepper */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Transfer State Machine Pipeline
                </div>

                <div className="grid grid-cols-6 gap-2">
                  {LIFECYCLE_STAGES.map((stage, idx) => {
                    const isCompleted = currentStageIndex > idx || selectedTransfer.state === 'committed';
                    const isCurrent = selectedTransfer.state === stage;
                    const isRejected = selectedTransfer.state === 'rejected';

                    return (
                      <div
                        key={stage}
                        className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                          isRejected
                            ? 'bg-slate-950 border-slate-800 text-slate-600 opacity-40'
                            : isCurrent
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/30'
                            : isCompleted
                            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="text-[10px] font-mono font-bold">{idx + 1}</div>
                        <div className="text-[10px] font-medium uppercase tracking-wider truncate max-w-full">
                          {stage}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Controls for Current Stage */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Action Required:</span>
                  {selectedTransfer.state === 'prepared' && 'Sender application is ready to dispatch package to Core.'}
                  {selectedTransfer.state === 'sent' && 'Package transmitted. Sibling application must import or acknowledge.'}
                  {selectedTransfer.state === 'imported' && 'Imported in recipient session. Ready for engineering peer review.'}
                  {selectedTransfer.state === 'reviewed' && 'Review logged. Ready to trigger Technical & Engineering Validation.'}
                  {selectedTransfer.state === 'validated' && 'Validation passed with zero fatal errors. Ready to Commit to Dataset!'}
                  {selectedTransfer.state === 'committed' && 'Immutable Revision published to Dataset lineage with audit receipt.'}
                  {selectedTransfer.state === 'rejected' && 'Transfer rejected. No changes committed to source dataset.'}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedTransfer.state === 'prepared' && (
                    <button
                      onClick={() => handleAdvanceToState('sent')}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Dispatch (Send)
                    </button>
                  )}

                  {selectedTransfer.state === 'sent' && (
                    <button
                      onClick={() => handleAdvanceToState('imported')}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                    >
                      Mark as Imported
                    </button>
                  )}

                  {selectedTransfer.state === 'imported' && (
                    <button
                      onClick={() => handleAdvanceToState('reviewed')}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Complete Review
                    </button>
                  )}

                  {selectedTransfer.state === 'reviewed' && (
                    <button
                      onClick={() => handleAdvanceToState('validated')}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Run Validation
                    </button>
                  )}

                  {selectedTransfer.state === 'validated' && (
                    <>
                      <button
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 text-xs font-semibold rounded-lg"
                      >
                        Reject
                      </button>
                      <button
                        onClick={handleCommit}
                        disabled={isProcessing}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" /> Commit Change
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Deep Structural Diff Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-200">Structural Attribute Diff</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  CRS: {selectedTransfer.package.crs || 'EPSG:3857'} • Units: {selectedTransfer.package.units || 'meters'}
                </span>
              </div>

              {selectedTransfer.diff ? (
                <DiffViewer
                  diff={selectedTransfer.diff}
                  sourceAppName={selectedTransfer.sourceApplicationId}
                  destAppName={selectedTransfer.destinationApplicationId}
                  onResolveConflict={(entityId, fieldName, strategy, manualValue) => {
                    resolveTransferConflict(
                      selectedTransfer.transferId,
                      entityId,
                      fieldName,
                      strategy,
                      manualValue
                    );
                  }}
                />
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No structural diff available for this transfer payload.
                </div>
              )}
            </div>

            {/* Validation & Review Notes Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">Reviewer Notes & Verification</span>
                <span className="text-[10px] text-slate-400">Actor: {currentUser.name}</span>
              </div>

              <textarea
                rows={2}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-blue-500"
              />

              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>
                  Committing this transfer will increment the source dataset revision, register an immutable SHA-256 snapshot, and write a permanent audit entry.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
            Select a transfer package from the left to view its lifecycle state machine, diff, and verification controls.
          </div>
        )}
      </div>
    </div>
  );
};
