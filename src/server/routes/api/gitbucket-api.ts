import dotenv from 'dotenv';
import { Octokit } from 'octokit';
import express, { Request, Response } from 'express';

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITBUCKET_TOKEN,
  baseUrl: process.env.GITBUCKET_URL,
});


export const gitbucketAPIRouter = express.Router();

gitbucketAPIRouter.get('/repos', async (req: Request, res: Response) => {
  try {
    const repos = await octokit.request('GET /user/repos', {});
    res.json(repos.data);
  } catch (err) {
    console.error('Error fetching repositories:', err);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

gitbucketAPIRouter.post('/create/:repo', async (req: Request, res: Response) => {
  try {
    const repoName = req.params.repo;
    const createRepoResponse = await octokit.request('POST /user/repos', {
      name: repoName,
      is_template: true,
    });
    res.json(createRepoResponse.data);
  } catch (err) {
    console.error('Error creating repository:', err);
    res.status(500).json({ error: 'Failed to create repository' });
  }
});

//not working :(
gitbucketAPIRouter.get('/:username/authorizations', async (req: Request, res: Response) => {
  console.log('Fetching authorizations for user:', req.params.username);
  try {
    const username = req.params.username;
    const authorizations = await octokit.request('POST /admin/users/{username}/authorizations', {
      username,
    });
    res.json(authorizations.data);
  } catch (err) {
    console.error('Error fetching authorizations:', err);
    res.status(500).json({ error: 'Failed to fetch authorizations' });
  }
});

//not working :(
gitbucketAPIRouter.post('/repos/clone/:templateowner/:templatename/:newowner', async (req: Request, res: Response) => {
  console.log('Cloning repository:', req.params.templateowner, req.params.templatename, req.params.newowner);
  try {
 
    const cloneResponse = await octokit.request('POST /repos/{template_owner}/{template_repo}/generate', {
      template_owner:req.params.templateowner,
      template_repo: req.params.templatename,
      owner: req.params.newowner,
      name: req.params.templatename,
      private: false,
    });
    res.json(cloneResponse.data);

  } catch (err) {
    console.error('Error cloning repository:', err);
    res.status(500).json({ error: 'Failed to clone repository' });
  }
});

gitbucketAPIRouter.get('/repos/:owner/:repo', async (req: Request, res: Response) => {
  console.log('Fetching repository details:', req.params.owner, req.params.repo);
  try {
    const repoDetails = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: req.params.owner,
      repo: req.params.repo,
    });
    res.json(repoDetails.data);
  } catch (err) {
    console.error('Error fetching repository details:', err);
    res.status(500).json({ error: 'Failed to fetch repository details' });
  }
});