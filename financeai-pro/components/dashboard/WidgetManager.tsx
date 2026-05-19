"use client"

import React, { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Settings2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface Widget {
  id: string
  title: string
  component: React.ReactNode
}

interface SortableWidgetProps {
  id: string
  children: React.ReactNode
}

function SortableWidget({ id, children }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-4 right-4 z-10 p-1 rounded-md bg-background/50 border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-primary" />
      </div>
      {children}
    </div>
  )
}

interface WidgetManagerProps {
  widgets: Widget[]
  storageKey: string
  onLayoutChange?: (order: string[]) => void
}

export function WidgetManager({ widgets, storageKey, onLayoutChange }: WidgetManagerProps) {
  const [items, setItems] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : widgets.map(w => w.id)
    }
    return widgets.map(w => w.id)
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string)
        const newIndex = items.indexOf(over.id as string)
        const newOrder = arrayMove(items, oldIndex, newIndex)
        
        localStorage.setItem(storageKey, JSON.stringify(newOrder))
        onLayoutChange?.(newOrder)
        return newOrder
      })
    }
  }

  const resetLayout = () => {
    const defaultOrder = widgets.map(w => w.id)
    setItems(defaultOrder)
    localStorage.removeItem(storageKey)
    onLayoutChange?.(defaultOrder)
  }

  // Map IDs to components
  const sortedWidgets = items
    .map(id => widgets.find(w => w.id === id))
    .filter((w): w is Widget => !!w)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Settings2 className="h-4 w-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Dashboard Düzeni</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetLayout} 
          className="text-[10px] h-7 gap-1 uppercase tracking-tighter hover:text-primary"
        >
          <RotateCcw className="h-3 w-3" />
          Varsayılana Dön
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 gap-6">
            {sortedWidgets.map((widget) => (
              <SortableWidget key={widget.id} id={widget.id}>
                {widget.component}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
