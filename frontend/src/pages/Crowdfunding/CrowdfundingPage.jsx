import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, Users, Calendar, Heart } from 'lucide-react';
import DonorNav from '../../components/DonorNav';

const CrowdfundingPage = () => {
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    category: '',
    endDate: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/crowdfunding/all`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/crowdfunding/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          creatorId: user.id,
          creatorEmail: user.primaryEmailAddress?.emailAddress,
          targetAmount: Number(formData.targetAmount)
        })
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({ title: '', description: '', targetAmount: '', category: '', endDate: '' });
        fetchProjects();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const contributeToProject = async (projectId, amount) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/crowdfunding/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          amount: Number(amount)
        })
      });

      if (response.ok) {
        fetchProjects();
        alert('Contribution successful!');
      }
    } catch (error) {
      console.error('Error contributing:', error);
    }
  };

  const ProjectCard = ({ project }) => {
    const [contributeAmount, setContributeAmount] = useState('');
    const percentage = (project.raisedAmount / project.targetAmount) * 100;
    const daysLeft = Math.max(0, Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24)));

    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <Badge variant="secondary">{project.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">by {project.creatorEmail}</p>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm mb-4">{project.description}</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>₹{project.raisedAmount.toLocaleString()}</span>
                <span>₹{project.targetAmount.toLocaleString()}</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-bold">{Math.round(percentage)}%</div>
                <div className="text-muted-foreground">Funded</div>
              </div>
              <div>
                <div className="font-bold">{project.contributors?.length || 0}</div>
                <div className="text-muted-foreground">Backers</div>
              </div>
              <div>
                <div className="font-bold">{daysLeft}</div>
                <div className="text-muted-foreground">Days Left</div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Input
            type="number"
            placeholder="Amount"
            value={contributeAmount}
            onChange={(e) => setContributeAmount(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={() => {
              if (contributeAmount) {
                contributeToProject(project._id, contributeAmount);
                setContributeAmount('');
              }
            }}
            disabled={!contributeAmount || project.status !== 'active'}
          >
            <Heart className="h-4 w-4 mr-1" />
            Fund
          </Button>
        </CardFooter>
      </Card>
    );
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <DonorNav />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Crowdfunding Projects</h1>
            <p className="text-muted-foreground">Support small-scale community projects</p>
          </div>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <form onSubmit={createProject} className="space-y-4">
                <Input
                  placeholder="Project Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
                <Textarea
                  placeholder="Project Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
                <Input
                  type="number"
                  placeholder="Target Amount (₹)"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  required
                />
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Environment">Environment</SelectItem>
                    <SelectItem value="Community">Community</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                />
                <Button type="submit" className="w-full">Create Project</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground">Be the first to create a crowdfunding project!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrowdfundingPage;