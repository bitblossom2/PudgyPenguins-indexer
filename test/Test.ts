import assert from "assert";
import { 
  TestHelpers,
  PudgyPenguins_CreatePenguin
} from "generated";
const { MockDb, PudgyPenguins } = TestHelpers;

describe("PudgyPenguins contract CreatePenguin event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for PudgyPenguins contract CreatePenguin event
  const event = PudgyPenguins.CreatePenguin.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("PudgyPenguins_CreatePenguin is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await PudgyPenguins.CreatePenguin.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualPudgyPenguinsCreatePenguin = mockDbUpdated.entities.PudgyPenguins_CreatePenguin.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedPudgyPenguinsCreatePenguin: PudgyPenguins_CreatePenguin = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      id: event.params.id,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualPudgyPenguinsCreatePenguin, expectedPudgyPenguinsCreatePenguin, "Actual PudgyPenguinsCreatePenguin should be the same as the expectedPudgyPenguinsCreatePenguin");
  });
});
