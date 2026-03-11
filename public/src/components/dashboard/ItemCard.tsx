import { useState } from 'react';
import {
  Card,
  Text,
  Group,
  ActionIcon,
  Modal,
  Button,
  Stack,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

interface ItemCardProps {
  id: number;
  name: string;
  createdAt: string;
  label: string;
  onClick: () => void;
  onDelete: () => void;
}

const ItemCard = ({ id, name, createdAt, label, onClick, onDelete }: ItemCardProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const formattedDate = new Date(createdAt).toLocaleDateString();

  return (
    <>
      <Card
        shadow='sm'
        padding='lg'
        radius='md'
        withBorder
        style={{ cursor: 'pointer' }}
        onClick={onClick}
      >
        <Group justify='space-between' align='flex-start'>
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Text fw={500} truncate>
              {name}
            </Text>
            <Text size='sm' c='dimmed'>
              {formattedDate}
            </Text>
          </Stack>
          <ActionIcon
            variant='subtle'
            color='red'
            onClick={(e) => {
              e.stopPropagation();
              setConfirmOpen(true);
            }}
            aria-label={`Delete ${label.toLowerCase()}`}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Card>

      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Delete ${label}`}
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete &quot;{name}&quot;? This action
            cannot be undone.
          </Text>
          <Group justify='flex-end'>
            <Button
              variant='default'
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button color='red' onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default ItemCard;
