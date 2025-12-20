# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


Ideas:
1. After one point, the player speed starts decreasing once they have collected sufficient no. of pickups
2. If the player stays stationary, the probability of the edges collapsing into a solid wall becomes higher with time until the player is ultimately trapped - also affects slow speed
3. Quest 1: Collect sufficient pickups
4. One type of gem allows to break the walls so that you can either rescue yourself or your fellow player
5. New pickups appear even in places already visited
6. Player can vote to make a room their homebase; in case of a non-unanimous vote, the room with majority disappears, in case of no majority, the rooms with equal no. of votes disappear
7. Rooms are safe hubs; from whom? monsters (mechanics to be decided).
8. In future Quests, you can betray your teammate to save yourself 
9. Find tools in rooms