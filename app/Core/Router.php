<?php
namespace Core;

class Router {
    private $routes = [];

    public function get($uri, $action) {
        $this->addRoute('GET', $uri, $action);
    }

    public function post($uri, $action) {
        $this->addRoute('POST', $uri, $action);
    }

    private function addRoute($method, $uri, $action) {
        $this->routes[] = [
            'method' => $method,
            'uri' => $uri,
            'action' => $action
        ];
    }

    public function dispatch($method, $uri) {
        // Strip query string
        $uri = parse_url($uri, PHP_URL_PATH);

        // Dynamically strip base paths to support XAMPP subfolders
        $scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
        $baseDir = dirname($scriptName); // e.g. /dream-go-studio/public
        $rootDir = dirname($baseDir);    // e.g. /dream-go-studio

        // Normalize paths
        $baseDir = str_replace('\\', '/', $baseDir);
        $rootDir = str_replace('\\', '/', $rootDir);

        if ($baseDir !== '/' && strpos($uri, $baseDir) === 0) {
            $uri = substr($uri, strlen($baseDir));
        } elseif ($rootDir !== '/' && strpos($uri, $rootDir) === 0) {
            $uri = substr($uri, strlen($rootDir));
        }

        // Normalize URI (remove trailing slash except for root)
        $uri = rtrim($uri, '/') === '' ? '/' : rtrim($uri, '/');

        foreach ($this->routes as $route) {
            // Replace :var with regex pattern
            $pattern = preg_replace('/\:([a-zA-Z0-9_]+)/', '([a-zA-Z0-9_\-]+)', $route['uri']);
            $pattern = '#^' . $pattern . '$#';

            if ($route['method'] === $method && preg_match($pattern, $uri, $matches)) {
                array_shift($matches); // Remove full match

                if (is_callable($route['action'])) {
                    return call_user_func_array($route['action'], $matches);
                }

                if (is_string($route['action'])) {
                    [$controller, $methodName] = explode('@', $route['action']);
                    $controllerClass = "Controllers\\{$controller}";
                    if (class_exists($controllerClass)) {
                        $controllerInstance = new $controllerClass();
                        if (method_exists($controllerInstance, $methodName)) {
                            return call_user_func_array([$controllerInstance, $methodName], $matches);
                        }
                    }
                }
            }
        }

        http_response_code(404);
        echo "404 Not Found";
    }
}
