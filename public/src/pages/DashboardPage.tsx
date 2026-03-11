import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import {
  Title,
  Button,
  Grid,
  Text,
  Modal,
  TextInput,
  Stack,
  Group,
  Loader,
  Alert,
  Container,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useStore } from '../stores/StoreContext';
import ItemCard from '../components/dashboard/ItemCard';

const NEW_PRESENTATION_MODAL = 'new-presentation';
const NEW_TEMPLATE_MODAL = 'new-template';

type ActiveModal = typeof NEW_PRESENTATION_MODAL | typeof NEW_TEMPLATE_MODAL | null;

const DashboardPage = observer(() => {
  const store = useStore();
  const navigate = useNavigate();
  const dashboard = store.dashboard;

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [newItemName, setNewItemName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dashboard.loadAll();
  }, [dashboard]);

  const openModal = (modal: ActiveModal) => {
    setNewItemName('');
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
    setNewItemName('');
  };

  const handleCreatePresentation = async () => {
    if (!newItemName.trim()) return;
    setCreating(true);
    try {
      const presentation = await dashboard.createPresentation(newItemName.trim());
      closeModal();
      navigate(`/presentations/${presentation.id}`);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newItemName.trim()) return;
    setCreating(true);
    try {
      const template = await dashboard.createTemplate(newItemName.trim());
      closeModal();
      navigate(`/templates/${template.id}/edit`);
    } finally {
      setCreating(false);
    }
  };

  if (dashboard.loading) {
    return (
      <Container py='xl'>
        <Group justify='center' py='xl'>
          <Loader />
        </Group>
      </Container>
    );
  }

  if (dashboard.error) {
    return (
      <Container py='xl'>
        <Alert color='red' title='Failed to load'>
          {dashboard.error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container py='xl'>
      <Title mb='xl'>Decks</Title>

      {/* Presentations Section */}
      <Stack mb='xl'>
        <Group justify='space-between' align='center'>
          <Title order={2}>Presentations</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => openModal(NEW_PRESENTATION_MODAL)}
          >
            New Presentation
          </Button>
        </Group>

        {dashboard.presentations.length === 0 ? (
          <Text c='dimmed'>No presentations yet. Create your first one!</Text>
        ) : (
          <Grid>
            {dashboard.presentations.map((presentation) => (
              <Grid.Col key={presentation.id} span={{ base: 12, sm: 6, md: 4 }}>
                <ItemCard
                  id={presentation.id}
                  name={presentation.name}
                  createdAt={presentation.createdAt}
                  label='Presentation'
                  onClick={() => navigate(`/presentations/${presentation.id}`)}
                  onDelete={() => dashboard.deletePresentation(presentation.id)}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>

      {/* Templates Section */}
      <Stack>
        <Group justify='space-between' align='center'>
          <Title order={2}>Templates</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => openModal(NEW_TEMPLATE_MODAL)}
          >
            New Template
          </Button>
        </Group>

        {dashboard.templates.length === 0 ? (
          <Text c='dimmed'>No templates yet. Create your first one!</Text>
        ) : (
          <Grid>
            {dashboard.templates.map((template) => (
              <Grid.Col key={template.id} span={{ base: 12, sm: 6, md: 4 }}>
                <ItemCard
                  id={template.id}
                  name={template.name}
                  createdAt={template.createdAt}
                  label='Template'
                  onClick={() => navigate(`/templates/${template.id}/edit`)}
                  onDelete={() => dashboard.deleteTemplate(template.id)}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>

      {/* New Presentation Modal */}
      <Modal
        opened={activeModal === NEW_PRESENTATION_MODAL}
        onClose={closeModal}
        title='New Presentation'
        centered
      >
        <Stack>
          <TextInput
            label='Name'
            placeholder='My presentation'
            value={newItemName}
            onChange={(e) => setNewItemName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePresentation()}
            autoFocus
          />
          <Group justify='flex-end'>
            <Button variant='default' onClick={closeModal} disabled={creating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreatePresentation}
              loading={creating}
              disabled={!newItemName.trim()}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* New Template Modal */}
      <Modal
        opened={activeModal === NEW_TEMPLATE_MODAL}
        onClose={closeModal}
        title='New Template'
        centered
      >
        <Stack>
          <TextInput
            label='Name'
            placeholder='My template'
            value={newItemName}
            onChange={(e) => setNewItemName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTemplate()}
            autoFocus
          />
          <Group justify='flex-end'>
            <Button variant='default' onClick={closeModal} disabled={creating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTemplate}
              loading={creating}
              disabled={!newItemName.trim()}
            >
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
});

export default DashboardPage;
