import { useState, useEffect } from 'react';
import type { Tag } from '../types';
import { getTags, addTagToLocation, removeTagFromLocation } from '../api/client';

interface Props {
  locationId: string;
  currentTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

export function TagManager({ locationId, currentTags, onTagsChange }: Props) {
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    getTags().then(setAllTags).catch(console.error);
  }, []);

  const hasTag = (tagId: string) => currentTags.some((t) => t.id === tagId);

  const toggleTag = async (tag: Tag) => {
    try {
      if (hasTag(tag.id)) {
        await removeTagFromLocation(locationId, tag.id);
        onTagsChange(currentTags.filter((t) => t.id !== tag.id));
      } else {
        await addTagToLocation(locationId, tag.id);
        onTagsChange([...currentTags, tag]);
      }
    } catch (err) {
      console.error('Tag toggle failed', err);
    }
  };

  return (
    <div className="tag-manager">
      <h4>Tags</h4>
      <div className="tag-list">
        {allTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag)}
            className={`tag-badge${hasTag(tag.id) ? ' tag-badge--active' : ''}`}
            style={{
              borderColor: tag.color,
              color: hasTag(tag.id) ? '#fff' : tag.color,
              backgroundColor: hasTag(tag.id) ? tag.color : 'transparent',
            }}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
}
