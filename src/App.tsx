import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './features/onboarding/Landing';
import { CategoryExplorer } from './features/onboarding/CategoryExplorer';
import { MindMap } from './features/visualization/MindMap';
import { GlobalMap } from './features/visualization/GlobalMap';
import { Recommendations } from './features/recommendations/Recommendations';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="onboarding" element={<CategoryExplorer />} />
          <Route path="map" element={<MindMap mode="personal" />} />
          <Route path="global-map" element={<GlobalMap />} />
          <Route path="recommendations" element={<Recommendations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
