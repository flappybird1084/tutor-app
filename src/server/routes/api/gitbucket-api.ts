import dotenv from 'dotenv';
import { Octokit } from 'octokit';
import express, { Request, Response } from 'express';
import child_process, { spawn } from 'child_process';

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

// gitbucketAPIRouter.post(
//   '/create/:repo',
//   async (req: Request, res: Response) => {
//     try {
//       const repoName = req.params.repo;
//       const createRepoResponse = await octokit.request('POST /user/repos', {
//         name: repoName,
//         is_template: true,
//       });
//       res.json(createRepoResponse.data);
//     } catch (err) {
//       console.error('Error creating repository:', err);
//       res.status(500).json({ error: 'Failed to create repository' });
//     }
//   }
// );
gitbucketAPIRouter.post(
  '/create/repo/:repoName/:repoOwner/:newName/:username/:password',
  async (req: Request, res: Response) => {
    console.log(
      `received request for repo create with params: ${JSON.stringify(req.params)}`
    );
    try {
      ///create-repo.sh http://100.64.0.25:8081/git/test/2test.git test test http://100.64.0.25:8081/api/v3 2test3
      const githubCloneUrl = `${process.env.GITBUCKET_CLONE_URL}/git/${req.params.repoOwner}/${req.params.repoName}.git`;
      console.log(`githubCloneUrl: ${githubCloneUrl}`);

      const endpoint: string = process.env.GITBUCKET_URL!;
      console.log(
        `spawming bash command src/scripts/create-repo.sh ${githubCloneUrl} ${req.params.username} ${req.params.password} ${endpoint} ${req.params.newName}`
      );
      const createProcess = spawn('bash', [
        'src/scripts/create-repo.sh',
        githubCloneUrl,
        req.params.username,
        req.params.password,
        endpoint,
        req.params.newName,
      ]);
      createProcess.stdout.on('data', data => {
        console.log(`stdout: ${data}`);
      });
      createProcess.stderr.on('data', data => {
        console.error(`stderr: ${data}`);
      });
      createProcess.on('close', code => {
        if (code === 0) {
          res.json({ message: 'Repository created successfully' });
        } else {
          res.status(500).json({ error: 'Failed to create repository' });
        }
      });
    } catch (err) {
      console.error('Error spawning bash:', err);
      res.status(500).json({ error: 'Failed to spawn bash' });
    }
  }
);

//not working :(
gitbucketAPIRouter.get(
  '/:username/authorizations',
  async (req: Request, res: Response) => {
    console.log('Fetching authorizations for user:', req.params.username);
    try {
      const username = req.params.username;
      const authorizations = await octokit.request(
        'POST /admin/users/{username}/authorizations',
        {
          username,
        }
      );
      res.json(authorizations.data);
    } catch (err) {
      console.error('Error fetching authorizations:', err);
      res.status(500).json({ error: 'Failed to fetch authorizations' });
    }
  }
);

gitbucketAPIRouter.post(
  '/repos/clone/:templateowner/:templatename/:newowner/:newname',
  async (req: Request, res: Response) => {
    const { templateowner, templatename, newowner, newname } = req.params;

    // Optional basic validation: allow only alphanumeric, underscore, dash
    const isSafe = /^[\w\-]+$/.test(
      templateowner + templatename + newowner + newname
    );
    if (!isSafe) {
      res
        .status(400)
        .json({
          error:
            'Invalid repository name or owner. We suspect it may contain malicious shell content',
        });
      return;
    }

    const firstRepoURL = `${process.env.GITBUCKET_CLONE_URL}/${templateowner}/${templatename}.git`;
    const secondRepoURL = `${process.env.GITBUCKET_CLONE_URL}/${newowner}/${newname}.git`;

    const cloneProcess = spawn('bash', [
      'src/scripts/duplicate-repo.sh',
      firstRepoURL,
      secondRepoURL,
    ]);

    cloneProcess.stdout.on('data', data => {
      console.log(`stdout: ${data}`);
    });

    cloneProcess.stderr.on('data', data => {
      console.error(`stderr: ${data}`);
    });

    cloneProcess.on('close', code => {
      if (code !== 0) {
        console.error(`Script exited with code ${code}`);
        return res.status(500).send('Error cloning repository');
      }
      console.log('Repository cloned successfully!');
      res.json({ message: 'Repository cloned successfully!' });
    });
  }
);

gitbucketAPIRouter.get(
  '/repos/:owner/:repo',
  async (req: Request, res: Response) => {
    console.log(
      'Fetching repository details:',
      req.params.owner,
      req.params.repo
    );
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
  }
);
