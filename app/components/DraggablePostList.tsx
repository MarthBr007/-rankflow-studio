'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface Post {
  id: string;
  [key: string]: any;
}

interface DraggablePostListProps {
  posts: Post[];
  onReorder: (newOrder: Post[]) => void;
  renderPost: (post: Post, index: number) => React.ReactNode;
}

function SortablePostItem({ post, index, renderPost }: { post: Post; index: number; renderPost: (post: Post, index: number) => React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className="draggable-post-item"
      style={{
        ...style,
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <div
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'grab',
          color: 'var(--color-text-muted)',
          padding: '4px',
          zIndex: 10,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} />
      </div>
      <div style={{ paddingLeft: '32px' }}>
        {renderPost(post, index)}
      </div>
    </div>
  );
}

export default function DraggablePostList({
  posts,
  onReorder,
  renderPost,
}: DraggablePostListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = posts.findIndex((post) => post.id === active.id);
      const newIndex = posts.findIndex((post) => post.id === over.id);

      const newOrder = arrayMove(posts, oldIndex, newIndex);
      onReorder(newOrder);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={posts.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        {posts.map((post, index) => (
          <SortablePostItem
            key={post.id}
            post={post}
            index={index}
            renderPost={renderPost}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
