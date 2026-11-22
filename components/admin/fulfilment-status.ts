import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Hammer,
  MapPin,
  PackageCheck,
  RotateCcw,
  Send,
  Truck,
  Undo2,
  XCircle,
} from 'lucide-react';
import type { FulfilmentStatus } from '@/lib/store/types';

export type FulfilmentStatusGroup = 'prep' | 'transit' | 'delivered' | 'issue';

export interface FulfilmentStatusStyle {
  group: FulfilmentStatusGroup;
  label: string;
  icon: LucideIcon;
  rowClass: string;
  textClass: string;
  mutedClass: string;
}

const PREP_CLASSES = {
  rowClass: 'border-blue-200/90 bg-blue-50/75',
  textClass: 'text-blue-800',
  mutedClass: 'text-blue-900/75',
};

const TRANSIT_CLASSES = {
  rowClass: 'border-amber-200/90 bg-amber-50/80',
  textClass: 'text-amber-800',
  mutedClass: 'text-amber-900/75',
};

const DELIVERED_CLASSES = {
  rowClass: 'border-emerald-200/90 bg-emerald-50/80',
  textClass: 'text-emerald-800',
  mutedClass: 'text-emerald-900/75',
};

const ISSUE_CLASSES = {
  rowClass: 'border-red-200/90 bg-red-50/80',
  textClass: 'text-red-800',
  mutedClass: 'text-red-900/75',
};

export const FULFILMENT_STATUS_STYLES: Record<FulfilmentStatus, FulfilmentStatusStyle> = {
  ORDER_PLACED: {
    group: 'prep',
    label: 'Order Placed',
    icon: Clock,
    ...PREP_CLASSES,
  },
  ORDER_RECEIVED: {
    group: 'prep',
    label: 'Order Received',
    icon: ClipboardCheck,
    ...PREP_CLASSES,
  },
  PROCESSING: {
    group: 'prep',
    label: 'Processing',
    icon: Hammer,
    ...PREP_CLASSES,
  },
  READY_TO_DISPATCH: {
    group: 'prep',
    label: 'Ready to Dispatch',
    icon: PackageCheck,
    ...PREP_CLASSES,
  },
  DISPATCHED: {
    group: 'transit',
    label: 'Dispatched',
    icon: Send,
    ...TRANSIT_CLASSES,
  },
  IN_TRANSIT: {
    group: 'transit',
    label: 'In Transit',
    icon: Truck,
    ...TRANSIT_CLASSES,
  },
  OUT_FOR_DELIVERY: {
    group: 'transit',
    label: 'Out for Delivery',
    icon: MapPin,
    ...TRANSIT_CLASSES,
  },
  DELIVERED: {
    group: 'delivered',
    label: 'Delivered',
    icon: CheckCircle2,
    ...DELIVERED_CLASSES,
  },
  CANCELLED: {
    group: 'issue',
    label: 'Cancelled',
    icon: XCircle,
    ...ISSUE_CLASSES,
  },
  RETURN_REQUESTED: {
    group: 'issue',
    label: 'Return Requested',
    icon: RotateCcw,
    ...ISSUE_CLASSES,
  },
  RETURNED: {
    group: 'issue',
    label: 'Returned',
    icon: Undo2,
    ...ISSUE_CLASSES,
  },
};

export function getFulfilmentStatusStyle(status: FulfilmentStatus): FulfilmentStatusStyle {
  return FULFILMENT_STATUS_STYLES[status] ?? FULFILMENT_STATUS_STYLES.ORDER_PLACED;
}
