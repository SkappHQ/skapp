'use client';

import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Task, TaskCard } from '@rootcodelabs/skapp-ui';

type DealStage = {
  id: string;
  name: string;
  color: string;
};

type Deal = {
  id: string;
  title: string;
  company: string;
  owner: string;
  value: number;
  stageId: string;
  probability: number;
  expectedCloseDate: string;
  tags: string[];
};

const initialDealStages: DealStage[] = [
  { id: 'new', name: 'New', color: '#60a5fa' },
  { id: 'qualified', name: 'Qualified', color: '#14b8a6' },
  { id: 'proposal', name: 'Proposal', color: '#f59e0b' },
  { id: 'negotiation', name: 'Negotiation', color: '#9366fd' },
  { id: 'won', name: 'Won', color: '#62b774' },
  { id: 'lost', name: 'Lost', color: '#dc2626' },
];

const initialDeals: Deal[] = [
  {
    id: 'deal-1001',
    title: 'Enterprise workspace rollout',
    company: 'Acme Finance',
    owner: 'Anusha',
    value: 82000,
    stageId: 'new',
    probability: 15,
    expectedCloseDate: '2026-07-12',
    tags: ['Enterprise', 'Finance'],
  },
  {
    id: 'deal-1002',
    title: 'Support automation package',
    company: 'Northstar Health',
    owner: 'Maya',
    value: 36000,
    stageId: 'qualified',
    probability: 35,
    expectedCloseDate: '2026-07-24',
    tags: ['Healthcare'],
  },
  {
    id: 'deal-1003',
    title: 'CRM migration and training',
    company: 'Harbor Retail',
    owner: 'Kavindu',
    value: 54000,
    stageId: 'proposal',
    probability: 55,
    expectedCloseDate: '2026-08-03',
    tags: ['Retail', 'Migration'],
  },
  {
    id: 'deal-1004',
    title: 'Annual analytics renewal',
    company: 'BluePeak Logistics',
    owner: 'Anusha',
    value: 128000,
    stageId: 'negotiation',
    probability: 75,
    expectedCloseDate: '2026-06-28',
    tags: ['Renewal'],
  },
  {
    id: 'deal-1005',
    title: 'Regional sales enablement',
    company: 'Sierra Foods',
    owner: 'Nimal',
    value: 41000,
    stageId: 'won',
    probability: 100,
    expectedCloseDate: '2026-06-10',
    tags: ['Expansion'],
  },
  {
    id: 'deal-1006',
    title: 'Procurement platform pilot',
    company: 'Lanka Supply Co.',
    owner: 'Maya',
    value: 23000,
    stageId: 'lost',
    probability: 0,
    expectedCloseDate: '2026-06-06',
    tags: ['Pilot'],
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const getStageDealIds = (deals: Deal[], stageId: string) =>
  deals.filter((deal) => deal.stageId === stageId).map((deal) => deal.id);

const findStageForDeal = (deals: Deal[], dealId: string) =>
  deals.find((deal) => deal.id === dealId)?.stageId;

interface DealCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: { type: 'deal', deal },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
      }}
      {...attributes}
      {...listeners}
      onClick={() => onClick(deal)}
      className="w-full cursor-grab rounded-lg bg-white p-3 text-left shadow-sm outline outline-1 outline-zinc-200 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="body3 font-medium text-zinc-500">{deal.id}</p>
          <h3 className="subtitle3 mt-1 line-clamp-2 text-zinc-950">
            {deal.title}
          </h3>
        </div>
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700">
          {deal.probability}%
        </span>
      </div>

      <p className="body3 mt-3 truncate text-zinc-600">{deal.company}</p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="subtitle4 text-zinc-950">
          {formatCurrency(deal.value)}
        </span>
        <span className="body3 truncate text-zinc-500">{deal.owner}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {deal.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
};

interface DealStageLaneProps {
  stage: DealStage;
  deals: Deal[];
  activeStageId: string | null;
  onDealClick: (deal: Deal) => void;
  onAddDeal: (stageId: string, title: string) => void;
}

const DealStageLane: React.FC<DealStageLaneProps> = ({
  stage,
  deals,
  activeStageId,
  onDealClick,
  onAddDeal,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const { setNodeRef } = useDroppable({
    id: `stage-${stage.id}`,
    data: { type: 'stage', stageId: stage.id, accepts: ['deal'] },
  });
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  const submitDeal = () => {
    if (!title.trim()) return;
    onAddDeal(stage.id, title.trim());
    setTitle('');
    setIsCreating(false);
  };

  return (
    <section
      ref={setNodeRef}
      className={`flex h-full w-[350px] shrink-0 flex-col rounded-lg bg-[var(--color-tertiary-background)] p-2 outline outline-1 outline-[var(--color-secondary-accent)] transition ${
        activeStageId === stage.id ? 'ring-2 ring-blue-300' : ''
      }`}
      aria-labelledby={`crm-stage-${stage.id}`}
    >
      <div
        className="h-[7px] rounded-[3px]"
        style={{ backgroundColor: stage.color }}
      />

      <div className="mt-3 flex items-start justify-between gap-3 px-2">
        <div className="min-w-0">
          <h2
            id={`crm-stage-${stage.id}`}
            className="subtitle1 truncate capitalize text-zinc-950"
          >
            {stage.name}
          </h2>
          <p className="body3 mt-1 text-zinc-500">
            {formatCurrency(totalValue)}
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-secondary-accent)] px-3 py-2 text-xs font-semibold text-zinc-600">
          {deals.length}
        </span>
      </div>

      <div className="custom-scroll mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-visible px-1 pb-2">
        <SortableContext
          items={deals.map((deal) => deal.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onClick={onDealClick} />
          ))}
        </SortableContext>

        {!isCreating ? (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="body3 rounded-lg px-4 py-2 font-medium text-zinc-600 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Add deal
          </button>
        ) : (
          <div className="rounded-lg bg-white p-3 shadow-sm outline outline-1 outline-zinc-200">
            <textarea
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              rows={3}
              autoFocus
              placeholder="Deal title"
              className="body2 w-full resize-none rounded-md border border-zinc-200 p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setIsCreating(false);
                }}
                className="body3 rounded-md px-3 py-2 font-medium text-zinc-500 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitDeal}
                className="body3 rounded-md bg-blue-600 px-3 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
                disabled={!title.trim()}
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const DealsKanbanBoard: React.FC = () => {
  const [dealStages] = useState<DealStage[]>(initialDealStages);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );

  const filteredDeals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return deals;

    return deals.filter((deal) =>
      [deal.title, deal.company, deal.owner, deal.id, ...deal.tags]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [deals, searchQuery]);

  const pipelineValue = filteredDeals.reduce(
    (sum, deal) => sum + deal.value,
    0,
  );

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((item) => item.id === event.active.id);
    setActiveDeal(deal || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);
    setActiveStageId(null);

    if (!over) return;

    const activeDealId = String(active.id);
    const overId = String(over.id);
    const sourceStageId = findStageForDeal(deals, activeDealId);

    if (!sourceStageId) return;

    const targetStageId = overId.startsWith('stage-')
      ? overId.replace('stage-', '')
      : findStageForDeal(deals, overId);

    if (!targetStageId) return;

    setDeals((currentDeals) => {
      const activeIndex = currentDeals.findIndex(
        (deal) => deal.id === activeDealId,
      );

      if (activeIndex === -1) return currentDeals;

      const updatedDeals = currentDeals.map((deal) =>
        deal.id === activeDealId ? { ...deal, stageId: targetStageId } : deal,
      );

      if (sourceStageId === targetStageId && !overId.startsWith('stage-')) {
        const stageDeals = getStageDealIds(updatedDeals, sourceStageId);
        const oldStageIndex = stageDeals.indexOf(activeDealId);
        const newStageIndex = stageDeals.indexOf(overId);

        if (oldStageIndex === -1 || newStageIndex === -1) return updatedDeals;

        const reorderedStageIds = arrayMove(
          stageDeals,
          oldStageIndex,
          newStageIndex,
        );
        const reorderedSet = new Set(reorderedStageIds);
        let cursor = 0;

        return updatedDeals.map((deal) => {
          if (deal.stageId !== sourceStageId || !reorderedSet.has(deal.id)) {
            return deal;
          }

          const nextId = reorderedStageIds[cursor];
          cursor += 1;
          return updatedDeals.find((item) => item.id === nextId) || deal;
        });
      }

      const movingDeal = updatedDeals.find((deal) => deal.id === activeDealId);
      if (!movingDeal) return updatedDeals;

      const withoutMovingDeal = updatedDeals.filter(
        (deal) => deal.id !== activeDealId,
      );

      let insertIndex = withoutMovingDeal.length;
      if (!overId.startsWith('stage-')) {
        const overIndex = withoutMovingDeal.findIndex(
          (deal) => deal.id === overId,
        );
        if (overIndex !== -1) {
          insertIndex = overIndex;
        }
      }

      const nextDeals = [...withoutMovingDeal];
      nextDeals.splice(insertIndex, 0, movingDeal);
      return nextDeals;
    });
  };

  const handleDragOver = (event: DragEndEvent) => {
    const overId = event.over?.id ? String(event.over.id) : null;
    if (!overId) {
      setActiveStageId(null);
      return;
    }

    const stageId = overId.startsWith('stage-')
      ? overId.replace('stage-', '')
      : findStageForDeal(deals, overId);
    setActiveStageId(stageId || null);
  };

  const handleAddDeal = (stageId: string, title: string) => {
    const newDeal: Deal = {
      id: `deal-${Date.now().toString().slice(-6)}`,
      title,
      company: 'New account',
      owner: 'Unassigned',
      value: 0,
      stageId,
      probability: 10,
      expectedCloseDate: new Date().toISOString().slice(0, 10),
      tags: ['New'],
    };

    setDeals((currentDeals) => [...currentDeals, newDeal]);
    setSelectedDeal(newDeal);
  };

  return (
    <main className="flex h-screen flex-col bg-white p-4">

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto overflow-y-hidden py-4">
          {dealStages.map((stage) => (
            <DealStageLane
              key={stage.id}
              stage={stage}
              deals={filteredDeals.filter((deal) => deal.stageId === stage.id)}
              activeStageId={activeStageId}
              onDealClick={setSelectedDeal}
              onAddDeal={handleAddDeal}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal && (
            <div className="w-[330px] rotate-1">
                
              <DealCard deal={activeDeal} onClick={() => undefined} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedDeal && (
        <aside className="fixed bottom-4 right-4 top-4 z-50 w-[360px] rounded-lg border border-zinc-200 bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="body3 font-medium text-zinc-500">
                {selectedDeal.id}
              </p>
              <h2 className="h3 mt-1 text-zinc-950">{selectedDeal.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDeal(null)}
              className="rounded-md px-2 py-1 text-xl leading-none text-zinc-500 hover:bg-zinc-100"
              aria-label="Close deal details"
            >
              ×
            </button>
          </div>

          <dl className="mt-6 space-y-4">
            <div>
              <dt className="body3 text-zinc-500">Company</dt>
              <dd className="subtitle3 mt-1 text-zinc-950">
                {selectedDeal.company}
              </dd>
            </div>
            <div>
              <dt className="body3 text-zinc-500">Owner</dt>
              <dd className="subtitle3 mt-1 text-zinc-950">
                {selectedDeal.owner}
              </dd>
            </div>
            <div>
              <dt className="body3 text-zinc-500">Value</dt>
              <dd className="subtitle3 mt-1 text-zinc-950">
                {formatCurrency(selectedDeal.value)}
              </dd>
            </div>
            <div>
              <dt className="body3 text-zinc-500">Expected close</dt>
              <dd className="subtitle3 mt-1 text-zinc-950">
                {selectedDeal.expectedCloseDate}
              </dd>
            </div>
          </dl>
        </aside>
      )}
    </main>
  );
};

export default DealsKanbanBoard;
