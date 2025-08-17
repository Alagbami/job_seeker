import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/auth', 'routes/auth.tsx'),
    route('/upload', 'routes/upload.tsx'),
    route('/resume/:id', 'routes/resume.tsx'),
    route('/wipe', 'routes/wipe.tsx'),
    route('/jobs', 'routes/JobsPage.tsx'),
    route('/profile', 'routes/ProfilePage.tsx'),

    // Catch-all: handles 404s and weird Chrome extension probes
    route("*", "routes/not-found.tsx"),

] satisfies RouteConfig;
