# Contributing to VOD Streaming Server

Thank you for your interest in contributing! 🎉

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/vod-streaming-server/issues)
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

### Suggesting Features

1. Check existing [Issues](https://github.com/yourusername/vod-streaming-server/issues) for similar suggestions
2. Create a new issue with:
   - Clear use case
   - Expected functionality
   - Potential implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/vod-streaming-server.git
cd vod-streaming-server

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development servers
cd backend && npm run dev
cd frontend && npm start
```

## Code Style

### Backend (Node.js)
- Use ES6+ features
- Follow Airbnb style guide
- Use async/await for async operations
- Add JSDoc comments for functions
- Keep files under 300 lines

### Frontend (React)
- Use functional components with hooks
- Follow React best practices
- Use Material-UI components
- Keep components focused and reusable
- Add PropTypes or TypeScript

### Naming Conventions
- Files: camelCase.js
- Components: PascalCase.jsx
- Variables: camelCase
- Constants: UPPER_CASE
- Database models: PascalCase

## Testing

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test

# Integration tests
./scripts/test-upload.sh
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add video quality selection
fix: resolve token expiration issue
docs: update API documentation
style: format code with prettier
refactor: simplify transcoding logic
test: add unit tests for auth
chore: update dependencies
```

## Code Review Process

1. All PRs require review from maintainers
2. Address review comments
3. Ensure CI/CD passes
4. Squash commits if needed
5. Merge when approved

## Areas Needing Help

- [ ] Additional video codecs support
- [ ] Mobile app development
- [ ] Performance optimization
- [ ] Documentation improvements
- [ ] Internationalization (i18n)
- [ ] Additional authentication methods
- [ ] Advanced analytics
- [ ] Subtitle support
- [ ] Live streaming support
- [ ] Enhanced security features

## Questions?

- Open a [Discussion](https://github.com/yourusername/vod-streaming-server/discussions)
- Join our [Discord](https://discord.gg/yourserver)
- Email: dev@yourdomain.com

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
