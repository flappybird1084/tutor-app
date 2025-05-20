import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Assignment, User } from '@server/schemas';

export const adminRouter = express.Router();
dotenv.config();

const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    console.log(`Unauthenticated request to ${req.url} (admin protected)`);
    res.redirect('/');
  }
};
adminRouter.use('/', adminOnly);

adminRouter.get('/mainpage', async (req: Request, res: Response) => {
  // console.log('User is authenticated:', req.user);
  const userObject = await User.findById(req.user.sub);
  const email = userObject?.email;
  const username = userObject?.username;
  const role = userObject?.role;
  res.render('admin/admin', { user: req.user, email, username, role });
});

adminRouter.get('/users', async (req: Request, res: Response) => {
  const users = await User.find();
  res.render('admin/user-management', { users });
});

adminRouter.get(
  '/assignments',

  async (req: Request, res: Response) => {
    const assignments = await Assignment.find({ type: 'template' });
    res.render('admin/assignments/assignments', { assignments });
  }
);

adminRouter.get('/assignments/create', async (req: Request, res: Response) => {
  res.render('admin/assignments/create-assignment');
});

adminRouter.post(
  '/assignments/create',

  async (req: Request, res: Response) => {
    const { dueDate } = req.body;
    const title = req.body.title;
    const description = req.body.description;
    // const dueDate = req.body.dueDate;
    const assignment = new Assignment({ title, description, type: 'template' });
    await assignment.save();
    res.redirect('/admin/assignments');
  }
);

adminRouter.get(
  '/assignments/edit/:id',

  async (req: Request, res: Response) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).send('Assignment not found');
    }
    res.render('admin/assignments/edit-assignment', { assignment });
  }
);

adminRouter.post(
  '/assignments/edit/:id',

  async (req: Request, res: Response) => {
    const { dueDate } = req.body;
    const title = req.body.title;
    const description = req.body.description;
    const githubLink = req.body.githubLink;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).send('Assignment not found');
      return;
    }
    assignment.title = title;
    assignment.description = description;
    assignment.dueDate = dueDate;
    assignment.githubLink = githubLink;
    await assignment.save();
    setTimeout(() => {
      res.redirect('/admin/assignments');
    }, 300);
  }
);

adminRouter.delete(
  '/assignments/delete/:id',

  async (req: Request, res: Response) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).send('Assignment not found');
      return;
    }
    await assignment.deleteOne();
    res.send('Assignment deleted');
  }
);

// adminRouter.get('/assignments/:userId', async (req: Request, res: Response) => {
//   const userId = req.params.userId;
//   const user = await User.findById(userId);
//   console.log("/assignments/userid: found user", user);
//   const assignments = await Assignment.find({ user: user });
//   res.json(assignments);
// });

adminRouter.get('/assign/:userId', async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);
  const assignments = await Assignment.find({ user: user });
  res.render('admin/assignments/assign', { assignments, toAssignUser: user });
});

adminRouter.get(
  '/assignments/search/:userId',
  async (req: Request, res: Response) => {
    const searchTerm = req.query.q;
    console.log('/assignments/search: found search term', searchTerm);
    const assignments = await Assignment.find({
      title: { $regex: searchTerm as string, $options: 'i' },
      type: 'template',
    });
    console.log('/assignments/search: found assignments', assignments);
    //convert json into divs for innerhtml replace
    let html = '';
    assignments.forEach(assignment => {
      html += `
      <div class="assignment-card" style="border:2px solid black; margin-top:10px">
       <a
       hx-post="/admin/assignments/assign/${assignment._id}/${req.params.userId}"
       hx-trigger="click"
       hx-on::after-request="window.location.reload();"
       > Assign</a> | ${assignment.title} | ${assignment.description} | <a href="${assignment.githubLink}">GitHub</a> 
      </div>
    `;
    });
    res.send(html);
  }
);

adminRouter.post(
  '/assignments/assign/:assignmentId/:userId',
  async (req: Request, res: Response) => {
    const assignmentId = req.params.assignmentId;
    const userId = req.params.userId;
    console.log('Assigning assignment:', assignmentId);
    try {
      const templateAssignment = await Assignment.findById(assignmentId);
      if (!templateAssignment) {
        res.status(404).send('Assignment not found');
        return;
      }
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).send('User not found');
        return;
      }
      await Assignment.create({
        title: templateAssignment.title + ' - assigned',
        description: templateAssignment.description,
        githubLink: templateAssignment.githubLink,
        dueDate: templateAssignment.dueDate,
        status: 'in-progress',
        type: 'assigned',
        user: user,
      });
      res.send('Assignment assigned successfully');
    } catch (error) {
      console.error('Error assigning assignment:', error);
      res.status(500).send('Failed to assign assignment');
    }
  }
);
